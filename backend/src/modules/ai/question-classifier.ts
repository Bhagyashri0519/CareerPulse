/**
 * question-classifier.ts
 * Robust, semantic question classifier for CareerPulse AI.
 * Handles natural language paraphrases, synonyms, and conversational follow-up context.
 */

import { detectNonexistentFeature, NonexistentFeature } from './feature-registry';

export type UserIntent =
  | 'resume_upload'
  | 'skill_import'
  | 'resume_skills_not_showing'
  | 'see_skills'
  | 'see_profile'
  | 'dashboard_explanation'
  | 'getting_started'
  | 'career_guidance'
  | 'technical_troubleshooting'
  | 'nonexistent_feature'
  | 'follow_up'
  | 'website_navigation'
  | 'feature_explanation'
  | 'general_question';

export interface ClassificationResult {
  intent: UserIntent;
  confidence: number;
  targetFeatureId?: string;
  nonexistentFeature?: NonexistentFeature;
  followUpContext?: {
    referringTurn?: number;
    subject?: string;
  };
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'ai';
  content?: string;
  text?: string;
}

/**
 * Normalizes text for semantic pattern matching:
 * Lowercases, strips excess whitespace, and standardizes common punctuation.
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s/]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Checks if query contains conversational follow-up markers referring to a previous message.
 */
function isConversationalFollowUp(normQuery: string, history: ChatMessage[]): boolean {
  if (!history || history.length === 0) return false;

  const followUpPhrases = [
    'step ',
    'what about step',
    'how do i do step',
    'tell me more about that',
    'can you explain that further',
    'where was that again',
    'what did you mean by that',
    'how to do that',
    'what about the second one',
    'explain the last point',
    'can you elaborate',
    'how do i do this',
    'and then what',
  ];

  return followUpPhrases.some((phrase) => normQuery.includes(phrase));
}

/**
 * Classifies an incoming student question into a well-defined domain intent.
 */
export function classifyQuestion(
  rawQuery: string,
  history: ChatMessage[] = [],
  currentPage = '/dashboard',
): ClassificationResult {
  const norm = normalizeText(rawQuery);

  // 1. Check for nonexistent features first
  const nonexistent = detectNonexistentFeature(rawQuery);
  if (nonexistent) {
    return {
      intent: 'nonexistent_feature',
      confidence: 0.95,
      nonexistentFeature: nonexistent,
    };
  }

  // 2. Check for conversational follow-up
  if (isConversationalFollowUp(norm, history)) {
    // Identify subject from the last assistant message
    const lastAssistantMsg = [...history].reverse().find((h) => h.role === 'assistant' || h.role === 'ai');
    const lastContent = (lastAssistantMsg?.content || lastAssistantMsg?.text || '').toLowerCase();

    let subject = 'general';
    if (lastContent.includes('resume') || lastContent.includes('upload')) {
      subject = 'resume_upload';
    } else if (lastContent.includes('import') || lastContent.includes('skill cards')) {
      subject = 'skill_import';
    } else if (lastContent.includes('dashboard') || lastContent.includes('readiness')) {
      subject = 'dashboard';
    } else if (lastContent.includes('assessment') || lastContent.includes('quiz')) {
      subject = 'assessment';
    }

    return {
      intent: 'follow_up',
      confidence: 0.85,
      followUpContext: { subject },
    };
  }

  // 3. Why are resume skills not showing in profile? (Must precede general resume & skills)
  const skillsNotShowingPatterns = [
    /why (are|aren t|arent|is not|isnt) (my )?(resume )?skills (not )?(showing|appearing|visible|present|in my profile)/i,
    /skills (are )?(not|arent) (showing|appearing|visible) in (my )?profile/i,
    /resume skills (not in|missing from) (my )?profile/i,
    /uploaded (my )?resume but (no|cannot see|cant see) skills/i,
    /why (did|do) (my )?skills not show up/i,
    /where did my (resume )?skills go/i,
    /i uploaded (my )?resume why are my skills not showing/i,
    /unverified skill claims/i,
    /why are (my )?skills unverified/i,
  ];

  for (const pattern of skillsNotShowingPatterns) {
    if (pattern.test(rawQuery) || pattern.test(norm)) {
      return { intent: 'resume_skills_not_showing', confidence: 0.95, targetFeatureId: 'resume_import' };
    }
  }

  // 4. How to import skills from resume? (Selective skill import)
  const skillImportPatterns = [
    /how (do|can) i import skills/i,
    /import skills from (my )?(resume|cv|biodata)/i,
    /how to import (selected )?skills/i,
    /how (do|can) i add skills from (my )?resume/i,
    /import (selected )?skills to profile/i,
    /how (do|can) i select skills to import/i,
    /transfer skills from resume/i,
    /apply skills from resume/i,
  ];

  for (const pattern of skillImportPatterns) {
    if (pattern.test(rawQuery) || pattern.test(norm)) {
      return { intent: 'skill_import', confidence: 0.95, targetFeatureId: 'resume_import' };
    }
  }

  // 5. Where should I upload my resume? / How can I add my CV? / Biodata upload
  // Handles all natural language paraphrases:
  // "Where should I upload my resume?", "How can I add my CV?", "I need to upload my biodata. Where?",
  // "Which page is used for resume upload?", "How do I put my resume into CareerPulse?", "Where do I submit my CV?"
  const resumeUploadPatterns = [
    /where (should|do|can) i upload (my )?(resume|cv|biodata)/i,
    /how (can|do) i (add|upload|submit|put) (my )?(resume|cv|biodata)/i,
    /upload (my )?(resume|cv|biodata)/i,
    /add (my )?(resume|cv|biodata)/i,
    /put (my )?(resume|cv|biodata)/i,
    /submit (my )?(resume|cv|biodata)/i,
    /where (is|to) (the )?resume upload/i,
    /which page (is used |is )?(for )?(resume|cv) upload/i,
    /i need to upload (my )?(resume|cv|biodata)/i,
    /where (can|do) i attach (my )?(resume|cv)/i,
    /how to parse (my )?(resume|cv)/i,
    /file format(s)? for resume/i,
    /resume file size limit/i,
    /supported (resume )?file types/i,
    /upload page/i,
  ];

  for (const pattern of resumeUploadPatterns) {
    if (pattern.test(rawQuery) || pattern.test(norm)) {
      return { intent: 'resume_upload', confidence: 0.95, targetFeatureId: 'resume' };
    }
  }

  // 6. Where can I see my skills? / Show my skills
  const seeSkillsPatterns = [
    /where (can|do) i (see|view|find|check) (my )?skills/i,
    /show (me )?(my )?skills/i,
    /where are my skills/i,
    /how (can|do) i see (my )?skills/i,
    /where is (my )?skill profile/i,
    /my skill profile/i,
    /skill profile page/i,
    /see all (my )?skills/i,
  ];

  for (const pattern of seeSkillsPatterns) {
    if (pattern.test(rawQuery) || pattern.test(norm)) {
      return { intent: 'see_skills', confidence: 0.95, targetFeatureId: 'skills' };
    }
  }

  // 7. Where can I see my profile? / How to edit my profile
  const seeProfilePatterns = [
    /where (can|do) i (see|view|find|check|edit) (my )?profile/i,
    /show (me )?(my )?profile/i,
    /where is my profile/i,
    /how (can|do) i (edit|update|change) (my )?profile/i,
    /my profile page/i,
    /where do i set (my )?target (career|role)/i,
    /where to change target career/i,
    /where (do|can) i change (my )?weekly (study )?hours/i,
  ];

  for (const pattern of seeProfilePatterns) {
    if (pattern.test(rawQuery) || pattern.test(norm)) {
      return { intent: 'see_profile', confidence: 0.95, targetFeatureId: 'profile' };
    }
  }

  // 8. What does my dashboard mean? / Explain my dashboard / Metrics explanation
  const dashboardExplanationPatterns = [
    /what does (my )?dashboard mean/i,
    /explain (my )?dashboard/i,
    /how (does|to use) (the )?dashboard (work)?/i,
    /what is career readiness/i,
    /what does career fit mean/i,
    /why is (my )?(career )?readiness (not evaluated|pending)/i,
    /explain (the )?evidence audit/i,
    /what are audit cards/i,
    /what does not evaluated mean/i,
    /dashboard metrics/i,
  ];

  for (const pattern of dashboardExplanationPatterns) {
    if (pattern.test(rawQuery) || pattern.test(norm)) {
      return { intent: 'dashboard_explanation', confidence: 0.95, targetFeatureId: 'dashboard' };
    }
  }

  // 9. How do I get started? / How do I use this website? / Onboarding
  const gettingStartedPatterns = [
    /how (do|can) i get started/i,
    /how to get started/i,
    /how (do|can) i use this (website|app|platform)/i,
    /how does (this )?(website|careerpulse) work/i,
    /getting started as a new user/i,
    /new user guide/i,
    /onboarding (steps|guide)/i,
    /what should i do first/i,
    /where do i begin/i,
    /what is the first step/i,
    /tour (the )?(website|platform)/i,
  ];

  for (const pattern of gettingStartedPatterns) {
    if (pattern.test(rawQuery) || pattern.test(norm)) {
      return { intent: 'getting_started', confidence: 0.95, targetFeatureId: 'dashboard' };
    }
  }

  // 10. Technical Troubleshooting (upload errors, parser errors, profile saving issues)
  const troubleshootingPatterns = [
    /upload (failed|error)/i,
    /file size (exceeds|limit|too large)/i,
    /parsing (failed|error)/i,
    /error saving profile/i,
    /cannot upload/i,
    /cant upload/i,
    /not working/i,
    /why did upload fail/i,
    /troubleshoot/i,
  ];

  for (const pattern of troubleshootingPatterns) {
    if (pattern.test(rawQuery) || pattern.test(norm)) {
      return { intent: 'technical_troubleshooting', confidence: 0.9 };
    }
  }

  // 11. Feature Explanations (Assessment, Learning Gap, Career Fit, Roadmap, Courses, Opportunities)
  if (norm.includes('assessment') || norm.includes('quiz') || norm.includes('verify')) {
    return { intent: 'feature_explanation', confidence: 0.9, targetFeatureId: 'assessment' };
  }
  if (norm.includes('learning gap') || norm.includes('skill gap')) {
    return { intent: 'feature_explanation', confidence: 0.9, targetFeatureId: 'learning_gap' };
  }
  if (norm.includes('career fit') || norm.includes('role fit')) {
    return { intent: 'feature_explanation', confidence: 0.9, targetFeatureId: 'career_fit' };
  }
  if (norm.includes('roadmap') || norm.includes('curriculum')) {
    return { intent: 'feature_explanation', confidence: 0.9, targetFeatureId: 'roadmap' };
  }
  if (norm.includes('course') || norm.includes('tutorials')) {
    return { intent: 'feature_explanation', confidence: 0.9, targetFeatureId: 'courses' };
  }
  if (norm.includes('opportunit') || norm.includes('internship') || norm.includes('job opening')) {
    return { intent: 'feature_explanation', confidence: 0.9, targetFeatureId: 'opportunities' };
  }
  if (norm.includes('analytics') || norm.includes('chart') || norm.includes('velocity')) {
    return { intent: 'feature_explanation', confidence: 0.9, targetFeatureId: 'analytics' };
  }

  // 12. Career Guidance (DSA, Interview prep, study planning, what to learn next)
  const careerGuidancePatterns = [
    /what should i learn next/i,
    /how (to|can i) prepare for (technical )?interview/i,
    /placement prep/i,
    /dsa study plan/i,
    /how to study for/i,
    /what skills (are|should i) (need|needed|required)/i,
    /how to become (a )?(full stack|ui ux|data|devops)/i,
    /recommend (a )?course/i,
    /how long (will it take|to become)/i,
  ];

  for (const pattern of careerGuidancePatterns) {
    if (pattern.test(rawQuery) || pattern.test(norm)) {
      return { intent: 'career_guidance', confidence: 0.85 };
    }
  }

  // 13. Direct Website Navigation
  const navigationPatterns = [
    /go to /i,
    /take me to /i,
    /navigate to /i,
    /open /i,
  ];

  for (const pattern of navigationPatterns) {
    if (pattern.test(rawQuery)) {
      return { intent: 'website_navigation', confidence: 0.8 };
    }
  }

  // Default to general question
  return { intent: 'general_question', confidence: 0.5 };
}
