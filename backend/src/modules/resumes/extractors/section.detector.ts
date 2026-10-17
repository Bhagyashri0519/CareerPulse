import {
  extractStructuredEducation,
  extractStructuredExperience,
  isNoiseOrDisclaimer,
  IEducationEntry,
  IWorkExperienceEntry,
} from './structured.extractor';

export interface ExtractedSections {
  education: string[];
  experience: string[];
  projects: string[];
  skills: string[];
  certifications: string[];
  structuredExperience?: IWorkExperienceEntry[];
  structuredEducation?: IEducationEntry[];
}

export type SectionKey = 'education' | 'experience' | 'projects' | 'skills' | 'certifications';

export const SECTION_HEADERS: Record<SectionKey, RegExp> = {
  projects: /^(academic projects|academic & personal projects|personal projects|key projects|selected projects|technical projects|capstone projects|major projects|software projects|projects|project)\b/i,
  education: /^(education|educational background|academic background|academic qualifications|education & training|education and training|degrees & education|degrees and education|qualifications|academic history|academics|degrees)\b(?!\s*projects)/i,
  experience: /^(experience|work experience|professional experience|employment history|employment|internship experience|internships|internship|industrial training|work history|career history|relevant experience|technical experience|practical experience|industry experience)\b/i,
  skills: /^(skills|technical skills|core competencies|technologies|tools & technologies|tools and technologies|key skills|tech stack|technical proficiencies|skills & tools|skills & technologies)\b/i,
  certifications: /^(certifications|certification|licenses|licenses & certifications|certificates|courses & certifications|training & certifications)\b/i,
};

export const BOUNDARY_HEADERS = /^(summary|professional summary|executive summary|profile|personal profile|objective|career objective|additional information|achievements|awards|honors|activities|extracurricular activities|leadership|languages|interests|hobbies|references|referees|declaration|declarations|disclaimer|disclaimers|test disclaimer|notice|confidentiality notice|notes|note|publications|research)\b/i;

const CONTACT_OR_LINK_REGEX = /(@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}|linkedin\.com|github\.com|\+91\b|\b\d{10}\b)/i;

/**
 * Strips leading/trailing punctuation, markdown hashes, bullet symbols, and pipes from candidate headers.
 */
export function cleanHeader(line: string): string {
  return line
    .replace(/^[#*•▪\-–—\d\.\s\|\(\)]+/, '')
    .replace(/[:\-_#=*\|\s\(\)]+$/, '')
    .trim();
}

/**
 * Classifies a line based on explicit contextual keywords when headings are interleaved,
 * consecutive, or text appears before the first recognized section heading.
 */
export function classifySemanticLine(line: string, currentSection?: SectionKey | null): SectionKey | 'ignore' | null {
  const trimmed = line.trim();
  if (!trimmed) return 'ignore';

  // Ignore disclaimers, declarations, and test notices
  if (isNoiseOrDisclaimer(trimmed)) {
    return 'ignore';
  }

  // Ignore pure contact or social profile lines from section items
  if (CONTACT_OR_LINK_REGEX.test(trimmed) && trimmed.length < 120) {
    return 'ignore';
  }

  // Ignore boundary headers such as Summary, Objective, Declarations
  const prefix = cleanHeader(trimmed.split(':')[0]);
  if (BOUNDARY_HEADERS.test(prefix)) {
    return 'ignore';
  }

  // Certifications explicit lines
  if (/^certifications?:/i.test(trimmed) || /\b(certified in|certificate in|licenses & certifications)\b/i.test(trimmed)) {
    return 'certifications';
  }

  // Skills explicit prefixes
  if (/^(programming languages|web technologies|databases|tools & platforms|additional skills|tech stack|technical skills|skills):/i.test(trimmed)) {
    return 'skills';
  }

  // Education signals (degrees, schools, boards, CGPA, percentages)
  if (
    /\b(bachelor of|master of|b\.tech|b\.e\b|b\.sc|bca\b|m\.tech|mca\b|ph\.d|diploma in)\b/i.test(trimmed) ||
    /\b(class 10th|class 12th|10th - ssc|12th - hsc|hsc|ssc)\b/i.test(trimmed) ||
    /\b(college of engineering|junior college|highschool|university|institute of technology|academy of management)\b/i.test(trimmed) ||
    /\b(cgpa\s*:\s*\d|percentage\s*:\s*\d)/i.test(trimmed)
  ) {
    return 'education';
  }

  // Project signals - must NOT be classified as experience
  if (
    /\b(developed|built|designed|implemented|created)\b.*\b(system|app|application|platform|dashboard|portal|website|tool|model|api|service|bot)\b/i.test(trimmed) ||
    /\b(attendance management system|booking system|prediction|smart traffic signal)\b/i.test(trimmed) ||
    /^(project|key project|capstone project|academic project|personal project):/i.test(trimmed)
  ) {
    return 'projects';
  }

  // Experience / Internship signals - require unambiguous role or company signal
  // Crucial: generic date ranges or the word "technologies" alone MUST NOT classify as experience!
  if (
    (/\b(machine learning intern|software engineering intern|frontend intern|backend intern|developer intern|summer intern|intern at|internship at)\b/i.test(trimmed)) ||
    (/\b(worked as|employed at|working as)\b/i.test(trimmed)) ||
    (/\b(pvt\.?\s*ltd|inc\.|corp\b)\b/i.test(trimmed) && /\b(intern|developer|engineer|analyst|designer|consultant)\b/i.test(trimmed))
  ) {
    // If currently inside projects, do not let an experience keyword override project context
    if (currentSection === 'projects') {
      return 'projects';
    }
    return 'experience';
  }

  return null;
}

/**
 * Detects resume sections with support for diverse header patterns, boundary resets,
 * multi-column PDF interleaved streams, and semantic classification.
 */
export function detectSections(rawText: string): ExtractedSections {
  const sections: ExtractedSections = {
    education: [],
    experience: [],
    projects: [],
    skills: [],
    certifications: [],
  };

  const lines = rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  let currentSection: SectionKey | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check if line is a noise or disclaimer line
    if (isNoiseOrDisclaimer(line)) {
      continue;
    }

    // Check if line looks like a header (short, typically <= 55 chars, and not an in-line item with content after colon)
    const colonIdx = line.indexOf(':');
    const hasInlineContent = colonIdx !== -1 && line.slice(colonIdx + 1).trim().length > 0;
    const prefixBeforeColon = colonIdx !== -1 ? cleanHeader(line.slice(0, colonIdx)) : cleanHeader(line);

    // Boundary headers (like SUMMARY, DECLARATIONS, DISCLAIMERS, AWARDS)
    // reset currentSection to prevent previous section from swallowing unrelated lines
    if (BOUNDARY_HEADERS.test(prefixBeforeColon)) {
      currentSection = null;
      continue;
    }

    if (line.length <= 55 && !hasInlineContent) {
      const clean = cleanHeader(line);

      let matched = false;
      for (const [key, regex] of Object.entries(SECTION_HEADERS) as [SectionKey, RegExp][]) {
        if (regex.test(clean)) {
          currentSection = key;
          matched = true;
          break;
        }
      }

      if (matched) {
        continue;
      }
    }

    const semanticType = classifySemanticLine(line, currentSection);
    if (semanticType === 'ignore') {
      continue;
    }

    // If semantic classifier identifies a strong match for another section, route to that section
    // but NEVER let projects leak into experience
    if (semanticType && semanticType !== currentSection) {
      if (currentSection === 'projects') {
        // Keep project technologies and lines in projects
        if (sections.projects.length < 50 && !sections.projects.includes(line)) {
          sections.projects.push(line);
        }
      } else {
        if (sections[semanticType].length < 50 && !sections[semanticType].includes(line)) {
          sections[semanticType].push(line);
        }
      }
      continue;
    }

    // Otherwise append to current active section if one is open
    if (currentSection && line.length > 0) {
      // Don't push standalone date fragments or noise into skills
      if (
        currentSection === 'skills' &&
        (/^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|\d{4})/i.test(line) || line.length < 3)
      ) {
        continue;
      }

      // If in experience, but line looks explicitly like a project without employment signals
      if (currentSection === 'experience' && /^(project|capstone|personal project):/i.test(line)) {
        if (sections.projects.length < 50 && !sections.projects.includes(line)) {
          sections.projects.push(line);
        }
        continue;
      }

      if (sections[currentSection].length < 50 && !sections[currentSection].includes(line)) {
        sections[currentSection].push(line);
      }
    } else if (semanticType && sections[semanticType].length < 50 && !sections[semanticType].includes(line)) {
      sections[semanticType].push(line);
    }
  }

  // Produce structured representations from the detected raw lines
  sections.structuredExperience = extractStructuredExperience(sections.experience);
  sections.structuredEducation = extractStructuredEducation(sections.education);

  return sections;
}

