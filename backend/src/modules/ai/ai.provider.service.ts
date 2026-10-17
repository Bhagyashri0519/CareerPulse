/**
 * ai.provider.service.ts
 * Multi-provider AI conversation engine for CareerPulse.
 * Connects to Gemini, OpenAI, or local AI Engine with bounded history, timeouts, and error handling.
 * Provides an intelligent, context-aware built-in domain mentor when external LLM keys are unconfigured.
 */

import { buildSystemPrompt } from './ai.system-prompt';
import { StudentContextSummary } from './student-context.service';
import { PLATFORM_FEATURES, ALLOWLISTED_INTERNAL_ROUTES } from './feature-registry';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'ai';
  content?: string;
  text?: string;
}

export interface NavigationAction {
  label: string;
  path: string;
}

export interface AIResponsePayload {
  reply: string;
  suggestions: string[];
  actions: NavigationAction[];
  meta: {
    provider: 'gemini' | 'openai' | 'groq' | 'ai_engine' | 'guided_navigator';
    isLiveAI: boolean;
    studentName: string;
    timestamp: string;
  };
}

export class AIProviderService {
  private getProviderConfig() {
    const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;
    const groqKey = process.env.GROQ_API_KEY;
    const aiEngineUrl = process.env.AI_ENGINE_URL;

    if (geminiKey) return { type: 'gemini' as const, key: geminiKey };
    if (openaiKey) return { type: 'openai' as const, key: openaiKey };
    if (groqKey) return { type: 'groq' as const, key: groqKey };
    if (aiEngineUrl && aiEngineUrl !== 'http://localhost:8000') {
      return { type: 'ai_engine' as const, url: aiEngineUrl };
    }
    return null;
  }

  public hasConfiguredProvider(): boolean {
    return this.getProviderConfig() !== null;
  }

  /**
   * Generates an intelligent, context-aware reply using either a live configured LLM
   * or the verified CareerPulse domain mentor engine.
   */
  async generateResponse(params: {
    userId: string;
    message: string;
    history: ChatMessage[];
    currentPage?: string;
    studentContext: StudentContextSummary;
  }): Promise<AIResponsePayload> {
    const { message, history, currentPage = '/dashboard', studentContext } = params;
    const provider = this.getProviderConfig();

    // 1. If an external provider key is configured, call the live LLM
    if (provider) {
      try {
        const liveReply = await this.callExternalLLM(provider, message, history, studentContext, currentPage);
        if (liveReply) {
          const actions = this.extractNavigationActions(liveReply, currentPage);
          const suggestions = this.generateSuggestions(currentPage, studentContext);

          return {
            reply: liveReply,
            suggestions,
            actions,
            meta: {
              provider: provider.type,
              isLiveAI: true,
              studentName: studentContext.studentName,
              timestamp: new Date().toISOString(),
            },
          };
        }
      } catch (err) {
        console.error('[AI Provider Error]:', err);
        // Fall through to domain mentor with notice or return understandable error
      }
    }

    // 2. Built-in verified CareerPulse Domain Mentor & Navigator
    const builtInReply = this.generateDomainMentorReply(message, studentContext, currentPage);
    const actions = this.extractNavigationActions(builtInReply, currentPage);
    const suggestions = this.generateSuggestions(currentPage, studentContext);

    return {
      reply: builtInReply,
      suggestions,
      actions,
      meta: {
        provider: 'guided_navigator',
        isLiveAI: false,
        studentName: studentContext.studentName,
        timestamp: new Date().toISOString(),
      },
    };
  }

  /**
   * Calls external LLM API with 15s timeout and response length constraints.
   */
  private async callExternalLLM(
    provider: { type: 'gemini'; key: string } | { type: 'openai'; key: string } | { type: 'groq'; key: string } | { type: 'ai_engine'; url: string },
    userMessage: string,
    history: ChatMessage[],
    studentContext: StudentContextSummary,
    currentPage: string,
  ): Promise<string> {
    const systemPrompt = buildSystemPrompt(studentContext.contextText, currentPage);
    const boundedHistory = history.slice(-8); // Bounded to last 8 turns

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      if (provider.type === 'gemini') {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${provider.key}`;
        const contents = [
          ...boundedHistory.map((h) => ({
            role: h.role === 'user' ? 'user' : 'model',
            parts: [{ text: h.content || h.text || '' }],
          })),
          { role: 'user', parts: [{ text: userMessage }] },
        ];

        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents,
            generationConfig: {
              maxOutputTokens: 800,
              temperature: 0.7,
            },
          }),
        });

        if (!res.ok) {
          const errBody = await res.text().catch(() => '');
          throw new Error(`Gemini API error status ${res.status}: ${errBody}`);
        }

        const data = (await res.json()) as any;
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) throw new Error('Empty response from Gemini');
        return text;
      }

      if (provider.type === 'openai' || provider.type === 'groq') {
        const endpoint =
          provider.type === 'groq'
            ? 'https://api.groq.com/openai/v1/chat/completions'
            : 'https://api.openai.com/v1/chat/completions';
        const model = provider.type === 'groq' ? 'llama-3.3-70b-versatile' : 'gpt-4o-mini';

        const messages = [
          { role: 'system', content: systemPrompt },
          ...boundedHistory.map((h) => ({
            role: h.role === 'user' ? 'user' : 'assistant',
            content: h.content || h.text || '',
          })),
          { role: 'user', content: userMessage },
        ];

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${provider.key}`,
          },
          signal: controller.signal,
          body: JSON.stringify({
            model,
            messages,
            max_tokens: 800,
            temperature: 0.7,
          }),
        });

        if (!res.ok) {
          const errBody = await res.text().catch(() => '');
          throw new Error(`${provider.type.toUpperCase()} error status ${res.status}: ${errBody}`);
        }

        const data = (await res.json()) as any;
        const text = data?.choices?.[0]?.message?.content;
        if (!text) throw new Error('Empty response from LLM');
        return text;
      }

      throw new Error('Unsupported provider type');
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Built-in CareerPulse domain mentor and navigation guide.
   * Produces authentic, evidence-based, structured answers using actual student database values.
   */
  private generateDomainMentorReply(
    query: string,
    ctx: StudentContextSummary,
    currentPage: string,
  ): string {
    const q = query.toLowerCase().trim();
    const name = ctx.studentName;
    const targetCareer = ctx.targetCareer.title;
    const { onboarding, skills, resume } = ctx;

    // 1. Onboarding & Getting Started
    if (
      q.includes('get started') ||
      q.includes('how to start') ||
      q.includes('onboarding') ||
      q.includes('next step') ||
      q.includes('welcome')
    ) {
      return [
        `### Welcome, ${name}! Here is your personalized next step:`,
        ``,
        `**Current Status:**`,
        `- **Academic Profile**: ${onboarding.hasProfile ? '✅ Complete' : '⚠️ Incomplete'} (${ctx.academic.degree} ${ctx.academic.branch})`,
        `- **Resume Uploaded**: ${onboarding.hasResume ? `✅ Yes (${onboarding.resumeFileName})` : '⚠️ No resume uploaded'}`,
        `- **Skills in Profile**: ${onboarding.hasImportedSkills ? `✅ ${onboarding.importedSkillsCount} skills tracked` : '⚠️ No skills imported yet'}`,
        `- **Target Career Goal**: ${onboarding.hasTargetCareer ? `✅ ${targetCareer}` : '⚠️ Not selected'}`,
        `- **Verified Skills**: ${onboarding.hasVerifiedSkills ? `✅ ${onboarding.verifiedSkillsCount} verified` : '⏳ 0 verified'}`,
        ``,
        `**Recommended Action:**`,
        `${onboarding.nextRecommendedStep}`,
        ``,
        `Click below to proceed directly: [Open ${this.getRouteName(onboarding.nextRecommendedRoute)}](${onboarding.nextRecommendedRoute})`,
      ].join('\n');
    }

    // 2. Resume Upload & Extraction Guidance
    if (
      q.includes('upload resume') ||
      q.includes('resume') ||
      q.includes('cv') ||
      q.includes('extract')
    ) {
      if (!onboarding.hasResume) {
        return [
          `### How to Upload Your Resume to CareerPulse`,
          `1. Go to the [Resume Analysis & Ingestion](/resume) page.`,
          `2. Drag & drop your PDF or Word DOCX resume (max 5MB).`,
          `3. Our parser extracts your **Education**, **Work Experience**, **Projects**, and **Claimed Skills**.`,
          `4. Once extracted, check the skills you want to track and click **"Import Selected Skills to Profile"**.`,
          ``,
          `*Note: Uploading a resume extracts claims; you must explicitly import skills to add them to your profile.*`,
        ].join('\n');
      }

      return [
        `### Resume Status for ${name}`,
        `- **Uploaded File**: "${resume.fileName || 'Resume'}"`,
        `- **Extracted Claims**: **${resume.totalClaimsCount} total skills** detected in your resume.`,
        `- **Imported to Profile**: **${resume.importedClaimsCount} skills** have been added to your profile.`,
        `- **Pending Import**: **${resume.unimportedClaimsCount} skills** are available to import.`,
        ``,
        resume.unimportedClaimsCount > 0
          ? `You can import the remaining ${resume.unimportedClaimsCount} skills by visiting [Resume Analysis](/resume) and clicking **"Import Selected Skills"**.`
          : `All extracted skills have been imported into your profile! Your next step is to verify them through [Skill Assessment](/assessment).`,
      ].join('\n');
    }

    // 3. Skills Not Showing Up / Unverified Skills Lifecycle
    if (
      q.includes('not showing') ||
      q.includes('missing skill') ||
      q.includes('unverified') ||
      q.includes('claim') ||
      q.includes('why are')
    ) {
      return [
        `### How CareerPulse Skill Evidence Works`,
        `CareerPulse follows strict assessment integrity standards to ensure skills shown on your profile are credible:`,
        ``,
        `1. **Resume Claims (Unverified)**: When you upload a resume, skills are extracted as claims. They do **not** automatically appear in your profile until you select and import them.`,
        `2. **Profile Skills**: Once imported, they are tracked in your profile, but marked as **"Unverified Claim"**.`,
        `3. **Verified Skills**: To prove proficiency for employers and unlock your Dashboard Career Readiness score, you must pass a skill quiz on the [Assessment](/assessment) page.`,
        ``,
        `**Your Current Count**: You have **${skills.unverifiedCount} unverified skills** and **${skills.verifiedCount} verified skills**.`,
        ``,
        `Ready to verify? [Take a Skill Assessment](/assessment)`,
      ].join('\n');
    }

    // 4. Dashboard & Metrics Explanation
    if (
      q.includes('dashboard') ||
      q.includes('readiness') ||
      q.includes('career fit') ||
      q.includes('not evaluated') ||
      q.includes('metrics')
    ) {
      return [
        `### Understanding Your Dashboard Metrics`,
        ``,
        `- **Career Readiness**: Measures your verified proficiency against industry benchmarks for **${targetCareer}**. If you have unverified skills from your resume, it displays "Not evaluated" or "Pending assessment" to preserve credibility.`,
        `- **Career Fit**: Analyzes how well your strengths align with **${targetCareer}**.`,
        `- **Evidence Audit (A–E)**:`,
        `  * **A. Resume Claims**: Total skills found in your document (${resume.totalClaimsCount}).`,
        `  * **B. Profile Skills**: Skills actively imported (${skills.totalTracked}).`,
        `  * **C. Unverified Claims**: Skills waiting for assessment confirmation (${skills.unverifiedCount}).`,
        `  * **D. Verified Skills**: Skills confirmed via tests (${skills.verifiedCount}).`,
        `  * **E. Career Required**: Benchmark skills required for ${targetCareer}.`,
        ``,
        `Take a look at your [Dashboard](/dashboard) or verify skills on [Assessment](/assessment).`,
      ].join('\n');
    }

    // 5. Target Career & Career Goals
    if (
      q.includes('target career') ||
      q.includes('career goal') ||
      q.includes('change career') ||
      q.includes('change goal') ||
      q.includes('role')
    ) {
      return [
        `### Target Career Goal`,
        `Your current target career is: **${targetCareer}**.`,
        ``,
        `**How to change your target career**:`,
        `1. Open [My Profile](/profile).`,
        `2. Scroll to the **Target Career Role** dropdown.`,
        `3. Select your desired career (e.g., Full Stack Developer, UI/UX Designer, Data Analyst).`,
        `4. Click **Save Profile**.`,
        ``,
        `Changing your target career updates all benchmark metrics on your [Dashboard](/dashboard) and [Learning Gaps](/learning-gap).`,
      ].join('\n');
    }

    // 6. What Should I Learn Next / Skill Gaps / Learning Roadmap
    if (
      q.includes('learn next') ||
      q.includes('gap') ||
      q.includes('what skills') ||
      q.includes('roadmap') ||
      q.includes('study')
    ) {
      if (skills.totalTracked === 0) {
        return [
          `### Personalized Learning Plan for ${name}`,
          `You don't have any skills tracked in your profile yet!`,
          ``,
          `**First Step**:`,
          `1. [Upload your resume](/resume) to extract your current skillset.`,
          `2. Import your skills and select your target career goal in [My Profile](/profile).`,
          `3. CareerPulse will then calculate your exact skill gaps and create a custom roadmap!`,
        ].join('\n');
      }

      return [
        `### Learning Priority for ${targetCareer}`,
        `Based on your current profile (${skills.totalTracked} skills tracked at **${ctx.academic.weeklyLearningHours} hours/week**):`,
        ``,
        `1. **Verify Existing Skills**: You have **${skills.unverifiedCount} unverified skills** (such as ${skills.trackedList.slice(0, 3).map((s) => s.name).join(', ') || 'your resume skills'}). Take the [Career Assessment](/assessment) to confirm your proficiency.`,
        `2. **Check Learning Gaps**: Visit the [Learning Gaps](/learning-gap) page to see the exact percentage deficit for required ${targetCareer} skills.`,
        `3. **Follow Your Roadmap**: Head to [My Roadmap](/roadmap) to follow your structured weekly milestones and project deliverables.`,
        ``,
        `At your commitment of **${ctx.academic.weeklyLearningHours} hrs/week**, consistent milestone completion is the fastest path to internship readiness!`,
      ].join('\n');
    }

    // 7. Technical Interview, DSA & Placement Preparation
    if (
      q.includes('interview') ||
      q.includes('dsa') ||
      q.includes('placement') ||
      q.includes('prepare') ||
      q.includes('job')
    ) {
      return [
        `### Placement & Technical Interview Strategy`,
        `To prepare effectively for ${targetCareer} placement interviews:`,
        ``,
        `1. **Data Structures & Algorithms (DSA)**:`,
        `   - Master Arrays, Strings, HashMaps, and Two-Pointer patterns first.`,
        `   - Progress to Trees, Graphs, and Dynamic Programming.`,
        `   - Aim for 3–5 problems per week at your ${ctx.academic.weeklyLearningHours} hrs/week pace.`,
        `2. **Domain-Specific Projects**:`,
        `   - Build 2 end-to-end projects demonstrating production practices (authentication, testing, deployment).`,
        `3. **Resume & Evidence**:`,
        `   - Keep your resume updated in [Resume Analysis](/resume) with quantifiable achievements.`,
        `4. **Mock Assessments**:`,
        `   - Complete the quizzes on [Assessment](/assessment) to build technical test confidence.`,
      ].join('\n');
    }

    // 8. Troubleshooting / Problems / Errors
    if (
      q.includes('problem') ||
      q.includes('error') ||
      q.includes('bug') ||
      q.includes('troubleshoot') ||
      q.includes('help') ||
      q.includes('issue')
    ) {
      return [
        `### CareerPulse Troubleshooting Guide`,
        `Here are quick solutions to common platform questions:`,
        ``,
        `- **Resume Upload Failed?** Ensure your resume is a PDF or Word DOCX under 5MB containing selectable text.`,
        `- **Skills Missing from Profile?** Uploading a resume only extracts claims; you must click "Import Selected Skills" on the [Resume Analysis](/resume) page.`,
        `- **Dashboard shows "Not evaluated"?** Complete a skill assessment on the [Assessment](/assessment) page to verify your claims.`,
        `- **Profile updates not saving?** Check all required fields (degree, branch, year) and verify your connection.`,
        ``,
        `Need help with a specific page? Let me know which page you are on!`,
      ].join('\n');
    }

    // 9. Default friendly, personalized response
    return [
      `Hi ${name}! 👋 I'm your CareerPulse AI Career Mentor & Website Guide.`,
      ``,
      `I can help you with:`,
      `- **Navigating CareerPulse**: Uploading resumes, importing skills, and using the [Dashboard](/dashboard).`,
      `- **Closing Skill Gaps**: Personalized recommendations for **${targetCareer}**.`,
      `- **Interview & Placement Prep**: Study plans, DSA practice, and roadmap milestones.`,
      `- **Troubleshooting**: Explaining metrics, verification status, and platform features.`,
      ``,
      `What would you like to work on today? Try one of the suggestions below!`,
    ].join('\n');
  }

  /**
   * Extracts safe navigation links matching internal route allowlist.
   */
  private extractNavigationActions(text: string, currentPage: string): NavigationAction[] {
    const actions: NavigationAction[] = [];
    const seenPaths = new Set<string>();

    // Regex to match Markdown links: [Label](/route)
    const linkRegex = /\[([^\]]+)\]\((\/[a-zA-Z0-9\-_/]*)\)/g;
    let match: RegExpExecArray | null;

    while ((match = linkRegex.exec(text)) !== null) {
      const label = match[1].trim();
      const path = match[2].trim();

      if (ALLOWLISTED_INTERNAL_ROUTES.includes(path) && path !== currentPage && !seenPaths.has(path)) {
        seenPaths.add(path);
        actions.push({ label, path });
      }
    }

    return actions.slice(0, 3);
  }

  /**
   * Generates dynamic contextual suggestion chips based on the student's current page and onboarding state.
   */
  public generateSuggestions(currentPage: string, ctx: StudentContextSummary): string[] {
    const { onboarding, skills } = ctx;

    if (currentPage === '/resume') {
      if (onboarding.unimportedClaimsCount > 0) {
        return [
          'How do I import selected skills?',
          'Why are resume skills unverified?',
          'What file types are supported?',
        ];
      }
      return [
        'How do I upload my resume?',
        'What skills should I include?',
        'Go to my Dashboard',
      ];
    }

    if (currentPage === '/profile') {
      return [
        'Where can I change my target career?',
        'How does weekly learning hours affect my roadmap?',
        'Explain my tracked skills',
      ];
    }

    if (currentPage === '/assessment') {
      return [
        'Why do I need to verify skills?',
        'What score do I need to pass?',
        'How does this affect my Dashboard?',
      ];
    }

    if (currentPage === '/roadmap' || currentPage === '/learning-gap') {
      return [
        'What should I learn next?',
        'How long to become internship-ready?',
        'How to prepare for technical interviews?',
      ];
    }

    // Default dashboard / general
    if (!onboarding.hasResume) {
      return [
        'How do I get started?',
        'Help me upload my resume',
        'Explain my dashboard',
      ];
    }

    if (skills.unverifiedCount > 0) {
      return [
        'Why is my career readiness not evaluated?',
        'What should I learn next?',
        'Explain the evidence audit cards',
      ];
    }

    return [
      'What should I learn next?',
      'How to prepare for placement interviews?',
      'How long to become internship-ready?',
      'Explain my dashboard',
    ];
  }

  private getRouteName(path: string): string {
    const match = Object.values(PLATFORM_FEATURES).find((f) => f.path === path);
    return match ? match.name : 'Page';
  }
}

export const aiProviderService = new AIProviderService();
export default aiProviderService;
