/**
 * ai.provider.service.ts
 * Multi-provider AI conversation engine and verified website guidance mentor for CareerPulse.
 * Connects to Gemini, OpenAI, Groq, or AI Engine with timeouts, fallbacks, and error resilience.
 * Provides transparent, accurate website guidance based on the verified feature registry.
 */

import { buildSystemPrompt } from './ai.system-prompt';
import { StudentContextSummary } from './student-context.service';
import {
  PLATFORM_FEATURES,
  ALLOWLISTED_INTERNAL_ROUTES,
  isRouteAllowlisted,
  getFeatureByPath,
} from './feature-registry';
import { classifyQuestion, ClassificationResult } from './question-classifier';

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
    intent?: string;
  };
}

export class AIProviderService {
  public getProviderConfig() {
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
   * Generates a context-aware reply using either a live configured LLM
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

    // 1. Classify the incoming student question
    const classification = classifyQuestion(message, history, currentPage);

    // 2. If an external provider key is configured, call the live LLM with fallback on error
    if (provider) {
      try {
        const liveReply = await this.callExternalLLM(
          provider,
          message,
          history,
          studentContext,
          currentPage,
          classification,
        );

        if (liveReply && liveReply.trim()) {
          const actions = this.extractNavigationActions(liveReply, currentPage, classification);
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
              intent: classification.intent,
            },
          };
        }
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : String(err);
        console.warn(`[AI Provider Warning]: Live provider ${provider.type} failed (${errMsg}). Falling back to verified website knowledge registry.`);
        // Gracefully fall through to the verified website guidance fallback
      }
    }

    // 3. Verified CareerPulse Domain Mentor & Website Guidance Fallback
    const builtInReply = this.generateDomainMentorReply(message, studentContext, currentPage, classification);
    const actions = this.extractNavigationActions(builtInReply, currentPage, classification);
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
        intent: classification.intent,
      },
    };
  }

  /**
   * Calls external LLM API with 15s timeout, bounded history, and abort controller.
   */
  public async callExternalLLM(
    provider:
      | { type: 'gemini'; key: string }
      | { type: 'openai'; key: string }
      | { type: 'groq'; key: string }
      | { type: 'ai_engine'; url: string },
    userMessage: string,
    history: ChatMessage[],
    studentContext: StudentContextSummary,
    currentPage: string,
    classification?: ClassificationResult,
  ): Promise<string> {
    const systemPrompt = buildSystemPrompt(
      studentContext.contextText,
      currentPage,
      classification?.targetFeatureId,
    );
    const boundedHistory = history.slice(-8);

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
              temperature: 0.5,
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
            temperature: 0.5,
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

      if (provider.type === 'ai_engine') {
        const res = await fetch(`${provider.url}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            message: userMessage,
            history: boundedHistory,
            student_context: studentContext,
            current_page: currentPage,
          }),
        });

        if (!res.ok) {
          throw new Error(`AI Engine error status ${res.status}`);
        }

        const data = (await res.json()) as any;
        if (!data?.reply) throw new Error('Empty response from AI Engine');
        return data.reply;
      }

      throw new Error('Unsupported provider type');
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Built-in verified CareerPulse Domain Mentor & Website Guidance Fallback.
   * Produces authentic, evidence-based, structured answers based strictly on the verified feature registry.
   */
  public generateDomainMentorReply(
    query: string,
    ctx: StudentContextSummary,
    currentPage: string,
    classification?: ClassificationResult,
  ): string {
    const cls = classification || classifyQuestion(query, [], currentPage);
    const name = ctx.studentName;
    const targetCareer = ctx.targetCareer.title;
    const { onboarding, skills, resume } = ctx;

    switch (cls.intent) {
      // 1. Where should I upload my resume? / How can I add my CV?
      case 'resume_upload': {
        const hasExisting = onboarding.hasResume;
        return [
          `You can upload your resume from the [Resume Analysis](/resume) page.`,
          ``,
          `1. Open CareerPulse and look at the sidebar.`,
          `2. Select **Resume Analysis** (📄).`,
          `3. Click the upload area or Browse button (or drag and drop your file).`,
          `4. Select your PDF (.pdf) or Word DOCX (.docx) resume within the application's file-size limit (10MB).`,
          `5. Wait for the parser to extract your sections and skill claims.`,
          `6. Review the extracted sections and skill claims in the Clean Skill Cards view.`,
          `7. Select the skills you want to import and confirm the import.`,
          ``,
          `**Important**: Uploading a resume extracts claims; it does not automatically import every skill into your profile or verify your proficiency.`,
          hasExisting
            ? `\n*Note: You currently have "${resume.fileName}" uploaded. Uploading a new resume will re-analyze your credentials and detect new skills.*`
            : '',
        ].filter(Boolean).join('\n');
      }

      // 2. How do I import skills from my resume?
      case 'skill_import': {
        return [
          `To import skills from your resume into your profile:`,
          ``,
          `1. Open CareerPulse and select [Resume Analysis](/resume) from the sidebar.`,
          `2. Select your uploaded resume from the list to view its parsed details.`,
          `3. Under Extracted Sections, click the **Skills** tab to view your Clean Skill Cards.`,
          `4. Review the detected skills, categories, and confidence levels.`,
          `5. Check the checkboxes next to the skills you want to track in your profile (or click "Select All").`,
          `6. Click the **"Import Selected Skills to Profile"** button.`,
          `7. Confirm the import in the dialog window.`,
          ``,
          `Once imported, your skills will immediately appear on your [My Skills](/skills) page and [Student Profile](/profile) as unverified claims. You can then take quizzes on [Career Assessment](/assessment) to verify them.`,
        ].join('\n');
      }

      // 3. Why are my resume skills not showing in my profile?
      case 'resume_skills_not_showing': {
        return [
          `Resume skills do not appear in your profile automatically upon upload because CareerPulse uses a selective import model with strict evidence integrity.`,
          ``,
          `When you upload a resume, CareerPulse extracts skill claims into the Resume Analysis page, but leaves the choice to you regarding which skills to add to your profile.`,
          ``,
          `**How to add your resume skills to your profile:**`,
          `1. Go to the [Resume Analysis](/resume) page from the sidebar.`,
          `2. Select your uploaded resume to view the parsed results.`,
          `3. Under Extracted Sections, click the **Skills** tab.`,
          `4. Check the boxes next to the skills you want to import.`,
          `5. Click **"Import Selected Skills to Profile"** and confirm.`,
          ``,
          `Once imported, your skills will appear on your [My Skills](/skills) and [Student Profile](/profile) pages as "unverified claims". To confirm proficiency and update your Dashboard Career Readiness, take a quiz on the [Career Assessment](/assessment) page.`,
        ].join('\n');
      }

      // 4. Where can I see my skills?
      case 'see_skills': {
        return [
          `You can view all your tracked skills on the [My Skills](/skills) page (or in your [Student Profile](/profile)).`,
          ``,
          `1. Look at the sidebar on the left.`,
          `2. Click **My Skills** (📊).`,
          `3. Filter skills by category tabs (Frontend, Backend, Design & UX, Data & AI, Cloud & DevOps, Soft Skills).`,
          `4. Each skill card displays your proficiency tier (Beginner, Developing, Proficient, Advanced) and evidence source badge (Resume Extracted, Quiz Assessment, or Self Report).`,
          ``,
          skills.totalTracked > 0
            ? `You currently have **${skills.totalTracked} skills** tracked in your profile (${skills.verifiedCount} verified, ${skills.unverifiedCount} unverified).`
            : `You do not have any skills in your profile yet. You can import them on the [Resume Analysis](/resume) page or add them manually in [My Profile](/profile).`,
        ].join('\n');
      }

      // 5. Where can I see my profile?
      case 'see_profile': {
        return [
          `You can view and edit your profile on the [Student Profile](/profile) page.`,
          ``,
          `1. Look at the sidebar on the left.`,
          `2. Click **My Profile** (👤), or click the student pill at the top of the sidebar.`,
          `3. On your profile page, you can review and update:`,
          `   - Academic credentials (Degree, Branch, Graduation Year, CGPA)`,
          `   - Target Career Role (e.g. Full Stack Developer, UI/UX Designer, Data Analyst)`,
          `   - Planned Weekly Learning Hours commitment (1–60 hours/week)`,
          `   - Bio and self-reported skills`,
          `4. After making changes, click **"Save Profile"** to apply them.`,
        ].join('\n');
      }

      // 6. What does my dashboard mean?
      case 'dashboard_explanation': {
        return [
          `The [Dashboard](/dashboard) is your central career command center that aggregates your verified skills, target role benchmarks, and active learning commitments.`,
          ``,
          `**Key Sections of Your Dashboard:**`,
          `1. **Dynamic Greeting & Next Steps**: Displays your personalized next action based on your onboarding status.`,
          `2. **Career Readiness**: Shows your percentage of verified skills required for **${targetCareer}**. If you have unverified skills from your resume, it displays "Not evaluated" or "Pending assessment" to preserve academic integrity.`,
          `3. **Career Fit**: Analyzes how your verified strengths match with **${targetCareer}** and related roles.`,
          `4. **Evidence Source-of-Truth Audit (Cards A–E)**:`,
          `   - **A. Resume Claims**: Total skills detected in your resume document (${resume.totalClaimsCount} detected).`,
          `   - **B. Profile Skills**: Skills explicitly imported into your profile (${skills.totalTracked} skills).`,
          `   - **C. Unverified Claims**: Skills waiting for assessment confirmation (${skills.unverifiedCount} unverified).`,
          `   - **D. Verified Skills**: Skills confirmed via quizzes or verified projects (${skills.verifiedCount} verified).`,
          `   - **E. Career Required**: Benchmark skills required by industry for ${targetCareer}.`,
          `5. **Target Pace**: Tracks your weekly study hours against your planned commitment (${ctx.academic.weeklyLearningHours} hrs/week).`,
        ].join('\n');
      }

      // 7. How do I get started as a new user? / How do I use this website?
      case 'getting_started': {
        return [
          `Welcome to CareerPulse, ${name}! Here is the recommended 5-step workflow to get started:`,
          ``,
          `1. **Set Up Your Profile**: Go to [My Profile](/profile), set your degree, select your **Target Career Goal**, and choose your weekly study commitment.`,
          `2. **Upload Your Resume**: Navigate to [Resume Analysis](/resume) and upload your PDF or Word DOCX resume (max 10MB) to extract your experience and skills.`,
          `3. **Import Selected Skills**: On the Resume Analysis page, review your Clean Skill Cards, check the skills you want to track, and click **"Import Selected Skills to Profile"**.`,
          `4. **Verify Your Skills**: Take quick technical quizzes on the [Career Assessment](/assessment) page to convert unverified claims into verified proficiency and unlock your Career Readiness score on the [Dashboard](/dashboard).`,
          `5. **Follow Your Learning Roadmap**: Visit [My Roadmap](/roadmap) to follow your personalized weekly milestones and close identified skill gaps.`,
          ``,
          `**Your Current Next Step**: ${onboarding.nextRecommendedStep}`,
        ].join('\n');
      }

      // 8. Nonexistent feature query (e.g. campus events, financial aid, tutor video call)
      case 'nonexistent_feature': {
        const ne = cls.nonexistentFeature;
        if (ne) {
          return [
            `CareerPulse does not currently have a **${ne.name}** feature.`,
            ``,
            `${ne.explanation}`,
            ``,
            `**Features available on CareerPulse:**`,
            `- **Resume Analysis & Ingestion** ([Resume Analysis](/resume)): Upload and parse PDF/DOCX resumes and selectively import skills.`,
            `- **Skill Profile & Verification** ([My Skills](/skills) & [Career Assessment](/assessment)): Track proficiencies and take verification quizzes.`,
            `- **Career Readiness & Fit** ([Dashboard](/dashboard) & [Career Fit](/career-fit)): Benchmark against industry roles.`,
            `- **Personalized Learning Roadmaps** ([My Roadmap](/roadmap)): Follow structured milestones to bridge skill gaps.`,
            `- **Opportunities** ([Opportunities](/opportunities)): Discover internships and job postings matched to your verified skills.`,
            ``,
            `Would you like to explore [${ne.recommendedAlternative.name}](${ne.recommendedAlternative.path}) instead?`,
          ].join('\n');
        }
        return [
          `This feature is not currently available on CareerPulse. CareerPulse focuses on resume parsing, skill verification, career readiness benchmarking, and learning roadmaps.`,
          `You can explore our available features using the sidebar or view your [Dashboard](/dashboard).`,
        ].join('\n');
      }

      // 9. Conversational Follow-Up Query
      case 'follow_up': {
        const subject = cls.followUpContext?.subject || 'general';
        if (subject === 'resume_upload' || subject === 'skill_import') {
          return [
            `To follow up on your resume and skill import:`,
            `1. Make sure your resume is a text-based PDF or DOCX file under 10MB.`,
            `2. Go to the [Resume Analysis](/resume) page from the sidebar.`,
            `3. After uploading, click on the **Skills** tab under Extracted Sections to view Clean Skill Cards.`,
            `4. Check the boxes next to the skills you want to import and click **"Import Selected Skills to Profile"**.`,
            `5. Then verify them through quizzes on [Career Assessment](/assessment).`,
            ``,
            `Let me know if you would like more detail on any specific step!`,
          ].join('\n');
        }
        if (subject === 'dashboard') {
          return [
            `To follow up on your Dashboard:`,
            `- Your Career Readiness score unlocks as soon as you verify your imported skills via quizzes on [Career Assessment](/assessment).`,
            `- To update your target role or weekly hours, visit [My Profile](/profile).`,
          ].join('\n');
        }
        return [
          `Following up on our previous discussion: you can manage your skills on [My Skills](/skills), upload documents on [Resume Analysis](/resume), and review progress on the [Dashboard](/dashboard).`,
          `Please let me know if you would like specific step-by-step guidance!`,
        ].join('\n');
      }

      // 10. Specific Feature Explanation
      case 'feature_explanation': {
        const feat = cls.targetFeatureId ? PLATFORM_FEATURES[cls.targetFeatureId] : undefined;
        if (feat) {
          return [
            `### ${feat.name} (\`${feat.path}\`)`,
            `**Location**: ${feat.sidebarIcon} ${feat.sidebarLabel} in the sidebar.`,
            ``,
            `**Purpose**: ${feat.purpose}`,
            ``,
            `**How to Use**:`,
            ...feat.howToUse.map((step, idx) => `${idx + 1}. ${step}`),
            ``,
            feat.prerequisites.length > 0 ? `**Prerequisites**: ${feat.prerequisites.join('; ')}` : '',
            ``,
            `[Open ${feat.name}](${feat.path})`,
          ].filter(Boolean).join('\n');
        }
        break;
      }

      // 11. Technical Troubleshooting
      case 'technical_troubleshooting': {
        return [
          `### CareerPulse Troubleshooting Guide`,
          ``,
          `- **Resume Upload Failed?** Ensure your document is a text-based PDF (.pdf) or Word document (.docx) under 10MB. Scanned images or password-protected files cannot be parsed.`,
          `- **Skills Missing from Profile?** Uploading a resume only extracts claims. You must explicitly check the skill cards and click **"Import Selected Skills to Profile"** on the [Resume Analysis](/resume) page.`,
          `- **Career Readiness shows "Not evaluated"?** Complete a verification quiz on [Career Assessment](/assessment) to verify your imported claims.`,
          `- **Profile Changes Not Saving?** Ensure required fields (Degree, Branch, Year) are filled in and click **"Save Profile"** on [My Profile](/profile).`,
          ``,
          `If you are experiencing an error on a specific page, let me know which page you are on!`,
        ].join('\n');
      }

      // 12. Career Guidance (DSA, Interview, study planning)
      case 'career_guidance': {
        return [
          `### Career & Placement Preparation for ${targetCareer}`,
          `Based on your target goal of **${targetCareer}** at **${ctx.academic.weeklyLearningHours} hours/week**:`,
          ``,
          `1. **Verify Your Current Skills**: You have **${skills.unverifiedCount} unverified skills** in your profile. Take quizzes on [Career Assessment](/assessment) to prove proficiency.`,
          `2. **Target Learning Gaps**: Visit [Learning Gaps](/learning-gap) to see required benchmark deficits for ${targetCareer}.`,
          `3. **Follow Your Milestone Roadmap**: Work through your structured curriculum and portfolio projects on [My Roadmap](/roadmap).`,
          `4. **Technical Interview Preparation**:`,
          `   - Practice core DSA patterns (Arrays, HashMaps, Two-Pointers, Trees) at 3–5 problems per week.`,
          `   - Build production-ready projects demonstrating end-to-end design and database management.`,
        ].join('\n');
      }

      default:
        break;
    }

    // Default friendly, structured guide
    return [
      `Hi ${name}! 👋 I'm your CareerPulse AI Career Mentor & Website Guide.`,
      ``,
      `I can help you with:`,
      `- **Navigating CareerPulse**: Uploading resumes on [Resume Analysis](/resume), importing skills, and using the [Dashboard](/dashboard).`,
      `- **Verifying Skills**: Taking quizzes on [Career Assessment](/assessment) to unlock your Career Readiness score.`,
      `- **Bridging Gaps**: Finding benchmark deficits on [Learning Gaps](/learning-gap) and following [My Roadmap](/roadmap).`,
      `- **Placement Preparation**: Study plans, DSA guidance, and interview readiness for **${targetCareer}**.`,
      ``,
      `What would you like to work on today? Try one of the suggestions below!`,
    ].join('\n');
  }

  /**
   * Extracts safe navigation links matching internal route allowlist.
   */
  public extractNavigationActions(
    text: string,
    currentPage: string,
    classification?: ClassificationResult,
  ): NavigationAction[] {
    const actions: NavigationAction[] = [];
    const seenPaths = new Set<string>();

    // Regex to match Markdown links: [Label](/route)
    const linkRegex = /\[([^\]]+)\]\((\/[a-zA-Z0-9\-_/]*)\)/g;
    let match: RegExpExecArray | null;

    while ((match = linkRegex.exec(text)) !== null) {
      const label = match[1].trim();
      const path = match[2].trim();

      if (isRouteAllowlisted(path) && path !== currentPage && !seenPaths.has(path)) {
        seenPaths.add(path);
        // Format label cleanly
        const cleanLabel = label.startsWith('Open ') ? label : `Open ${label}`;
        actions.push({ label: cleanLabel, path });
      }
    }

    // If classification specifies a target feature, ensure its action is present
    if (classification?.targetFeatureId) {
      const feat = PLATFORM_FEATURES[classification.targetFeatureId];
      if (feat && isRouteAllowlisted(feat.path) && feat.path !== currentPage && !seenPaths.has(feat.path)) {
        seenPaths.add(feat.path);
        actions.unshift({ label: `Open ${feat.sidebarLabel}`, path: feat.path });
      }
    }

    // If nonexistent feature has a recommended alternative, ensure that is included
    if (classification?.nonexistentFeature) {
      const alt = classification.nonexistentFeature.recommendedAlternative;
      if (alt && isRouteAllowlisted(alt.path) && alt.path !== currentPage && !seenPaths.has(alt.path)) {
        seenPaths.add(alt.path);
        actions.push({ label: `Open ${alt.name}`, path: alt.path });
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
          'Why are resume skills not showing in my profile?',
          'What file types are supported?',
        ];
      }
      return [
        'Where should I upload my resume?',
        'How do I import skills from my resume?',
        'Go to my Dashboard',
      ];
    }

    if (currentPage === '/profile') {
      return [
        'Where can I change my target career?',
        'Where can I see my skills?',
        'How does weekly study hours affect my roadmap?',
      ];
    }

    if (currentPage === '/assessment') {
      return [
        'Why do I need to verify skills?',
        'How does assessment affect Dashboard?',
        'What score is passing?',
      ];
    }

    if (currentPage === '/roadmap' || currentPage === '/learning-gap') {
      return [
        'What should I learn next?',
        'How do I prepare for technical interviews?',
        'Where can I see my skills?',
      ];
    }

    // Default dashboard / general
    if (!onboarding.hasResume) {
      return [
        'Where should I upload my resume?',
        'How do I get started as a new user?',
        'What does my dashboard mean?',
        'Where can I see my skills?',
      ];
    }

    if (skills.unverifiedCount > 0) {
      return [
        'Why are my resume skills not showing in my profile?',
        'What does my dashboard mean?',
        'Where can I see my skills?',
        'What should I learn next?',
      ];
    }

    return [
      'What should I learn next?',
      'How to prepare for placement interviews?',
      'What does my dashboard mean?',
      'Where can I see my skills?',
    ];
  }
}

export const aiProviderService = new AIProviderService();
export default aiProviderService;
