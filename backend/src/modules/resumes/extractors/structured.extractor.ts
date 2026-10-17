export interface IWorkExperienceEntry {
  role?: string;
  organization?: string;
  employmentType?: 'full-time' | 'internship' | 'contract' | 'part-time' | 'unknown';
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
  description?: string;
  rawText: string;
  confidence: number;
}

export interface IEducationEntry {
  degree?: string;
  institution?: string;
  fieldOfStudy?: string;
  startYear?: string;
  endYear?: string;
  grade?: string;
  currentStatus?: string;
  rawText: string;
  confidence: number;
}

// Regex patterns for detecting common degrees and qualifications
const DEGREE_PATTERNS: Array<{ regex: RegExp; degree: string }> = [
  { regex: /\b(bachelor of engineering|b\.?\s*e\.?\b)/i, degree: 'Bachelor of Engineering' },
  { regex: /\b(bachelor of technology|b\.?\s*tech\.?\b)/i, degree: 'B.Tech' },
  { regex: /\b(bachelor of science|b\.?\s*sc\.?\b)/i, degree: 'B.Sc' },
  { regex: /\b(bachelor of computer applications|bca\b)/i, degree: 'BCA' },
  { regex: /\b(bachelor of arts|b\.?\s*a\.?\b)/i, degree: 'B.A.' },
  { regex: /\b(bachelor of commerce|b\.?\s*com\.?\b)/i, degree: 'B.Com' },
  { regex: /\b(master of technology|m\.?\s*tech\.?\b)/i, degree: 'M.Tech' },
  { regex: /\b(master of science|m\.?\s*sc\.?\b)/i, degree: 'M.Sc' },
  { regex: /\b(master of engineering|m\.?\s*e\.?\b)/i, degree: 'M.E.' },
  { regex: /\b(master of computer applications|mca\b)/i, degree: 'MCA' },
  { regex: /\b(master of business administration|mba\b)/i, degree: 'MBA' },
  { regex: /\b(ph\.?d|doctor of philosophy)\b/i, degree: 'Ph.D' },
  { regex: /\b(diploma in [a-zA-Z\s]+|diploma)\b/i, degree: 'Diploma' },
  { regex: /\b(class 12th|12th\s*-\s*hsc|higher secondary|hsc)\b/i, degree: 'Class 12th / HSC' },
  { regex: /\b(class 10th|10th\s*-\s*ssc|secondary school|ssc)\b/i, degree: 'Class 10th / SSC' },
];

// Regex patterns for institution types
const INSTITUTION_REGEX = /\b([A-Z][a-zA-Z0-9&.,'\s]{3,60}?\b(?:College of Engineering|Institute of Technology|University|Junior College|Academy of Management and Technology|Polytechnic|High School|School|College|Vidyalaya|Campus|Academy))\b/i;

// Regex patterns for fields of study
const FIELD_OF_STUDY_PATTERNS: Array<{ regex: RegExp; field: string }> = [
  { regex: /\b(computer science and engineering|computer science & engineering|cse\b)/i, field: 'Computer Science and Engineering' },
  { regex: /\b(computer science|cs\b)/i, field: 'Computer Science' },
  { regex: /\b(information technology|it\b)/i, field: 'Information Technology' },
  { regex: /\b(data science|data analytics)\b/i, field: 'Data Science' },
  { regex: /\b(artificial intelligence|machine learning|ai\s*&\s*ml)\b/i, field: 'Artificial Intelligence & ML' },
  { regex: /\b(electronics and telecommunication|extc\b|ece\b)/i, field: 'Electronics & Telecommunication' },
  { regex: /\b(electrical engineering|electrical)\b/i, field: 'Electrical Engineering' },
  { regex: /\b(mechanical engineering|mechanical)\b/i, field: 'Mechanical Engineering' },
  { regex: /\b(civil engineering|civil)\b/i, field: 'Civil Engineering' },
  { regex: /\b(software engineering)\b/i, field: 'Software Engineering' },
];

// Grade / CGPA / Percentage patterns
const GRADE_REGEX = /\b(cgpa\s*[:=]?\s*\d+(?:\.\d+)?(?:\s*\/\s*\d+)?|\b\d+(?:\.\d+)?\s*(?:cgpa|gpa)\b|percentage\s*[:=]?\s*\d+(?:\.\d+)?%?|\b\d+(?:\.\d+)?\s*%\s*(?:marks|aggregate)?|gpa\s*[:=]?\s*\d+(?:\.\d+)?(?:\s*\/\s*\d+)?)/i;

// Date range patterns for education and experience
const DATE_RANGE_REGEX = /(?:(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec)\.?\s+)?(\d{4})\s*[-–—to]+\s*(?:(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec)\.?\s+)?(\d{4}|present|current|ongoing)/i;

const YEAR_RANGE_REGEX = /\b(19\d\d|20\d\d)\s*[-–—to]+\s*(19\d\d|20\d\d|present|current|ongoing)\b/i;

// Employment role keywords - must start near beginning of line
const ROLE_TITLE_REGEX = /^(?:[•*\-\s]*)([A-Za-z0-9&/,\s]{2,45}?\b(?:developer|engineer|intern(?:ship)?|analyst|designer|consultant|manager|trainee|architect|specialist|lead|administrator|fellow)(?:\s+(?:intern(?:ship)?|trainee|lead|specialist|developer|engineer))?)\b/i;

// Company name signals - require explicit preposition (at/@/with) or recognized corporate suffix after comma
const COMPANY_SIGNAL_REGEX = /(?:at|@|with)\s+([A-Z][a-zA-Z0-9&.,'\s]{1,55}?(?=\s*[\(\[]|\s*[-–—|]|$|\n))|,\s*([A-Z][a-zA-Z0-9&.,'\s]{1,55}?\b(?:Pvt\.?\s*Ltd\.?|Inc\.?|Corp\.?|LLC|Technologies|Solutions|Labs|Systems|Services|Infobyte|TechCorp|Consultancy|Software|Studio)\b)/i;

// Disclaimers, declarations, and noise regex
const NOISE_OR_DISCLAIMER_REGEX = /^(test\s+)?(disclaimer|declaration|statement|notes?|sample\s+resume|confidentiality\s+notice)\b|this\s+(sample|test|document|resume)\s+(is|was)\s+(created|generated|provided|intended)\s+for\s+(test|testing|demonstration|evaluation)|for\s+testing\s+purposes\s+only|lorem\s+ipsum|i\s+hereby\s+declare|true\s+to\s+the\s+best\s+of\s+my\s+knowledge/i;

const PROJECT_INDICATOR_REGEX = /\b(built|developed|implemented|designed|created)\b.*\b(system|app|application|platform|dashboard|portal|website|tool|model|api|service|bot)\b|^(project|key project|capstone project|academic project|personal project):/i;

/**
 * Checks if a line is a disclaimer, sample notice, or declaration that must be excluded.
 */
export function isNoiseOrDisclaimer(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return true;
  return NOISE_OR_DISCLAIMER_REGEX.test(trimmed);
}

/**
 * Parses raw education lines into structured education records without fabricating missing information.
 */
export function extractStructuredEducation(lines: string[]): IEducationEntry[] {
  const filteredLines = lines
    .map((l) => l.trim())
    .filter((l) => l && !isNoiseOrDisclaimer(l));

  if (filteredLines.length === 0) return [];

  const entries: IEducationEntry[] = [];

  // Group consecutive lines that belong to the same qualification
  // Often degrees span 1 or 2 lines (e.g. Line 1: Degree & CGPA, Line 2: College & Years)
  let currentEntry: Partial<IEducationEntry> | null = null;
  const entryTextLines: string[] = [];

  function commitEntry() {
    if (currentEntry && (currentEntry.degree || currentEntry.institution)) {
      const fullRaw = entryTextLines.join(' | ');
      let confidence = 0.6;
      if (currentEntry.degree && currentEntry.institution) confidence = 0.95;
      else if (currentEntry.degree) confidence = 0.85;
      else if (currentEntry.institution) confidence = 0.75;

      entries.push({
        degree: currentEntry.degree,
        institution: currentEntry.institution,
        fieldOfStudy: currentEntry.fieldOfStudy,
        startYear: currentEntry.startYear,
        endYear: currentEntry.endYear,
        grade: currentEntry.grade,
        currentStatus: currentEntry.currentStatus,
        rawText: fullRaw,
        confidence,
      });
    }
    currentEntry = null;
    entryTextLines.length = 0;
  }

  for (const line of filteredLines) {
    // Detect degree
    let matchedDegree: string | undefined;
    for (const p of DEGREE_PATTERNS) {
      if (p.regex.test(line)) {
        matchedDegree = p.degree;
        break;
      }
    }

    // Detect year range
    const yearMatch = line.match(YEAR_RANGE_REGEX);
    let startYear = yearMatch ? yearMatch[1] : undefined;
    let endYear = yearMatch ? yearMatch[2] : undefined;

    // Detect grade / CGPA
    const gradeMatch = line.match(GRADE_REGEX);
    const grade = gradeMatch ? gradeMatch[0].trim() : undefined;

    // Detect field of study
    let fieldOfStudy: string | undefined;
    for (const f of FIELD_OF_STUDY_PATTERNS) {
      if (f.regex.test(line)) {
        fieldOfStudy = f.field;
        break;
      }
    }

    // Detect institution
    let institution: string | undefined;
    const instMatch = line.match(INSTITUTION_REGEX);
    if (instMatch) {
      institution = instMatch[1].trim();
    }

    // Determine current status
    let currentStatus: string | undefined;
    if (/\b(pursuing|enrolled|current|ongoing)\b/i.test(line)) {
      currentStatus = 'Pursuing';
    } else if (endYear) {
      const numericEnd = parseInt(endYear, 10);
      const currentYear = new Date().getFullYear();
      if (!isNaN(numericEnd)) {
        if (numericEnd > currentYear) {
          currentStatus = `Expected ${numericEnd}`;
        } else {
          currentStatus = 'Completed';
        }
      } else if (/present|current|ongoing/i.test(endYear)) {
        currentStatus = 'Pursuing';
      }
    }

    if (matchedDegree) {
      // Start of a new educational credential
      commitEntry();
      currentEntry = {
        degree: matchedDegree,
        institution,
        fieldOfStudy,
        startYear,
        endYear,
        grade,
        currentStatus,
      };
      entryTextLines.push(line);
    } else if (currentEntry) {
      // Continuation line for current credential
      if (institution && !currentEntry.institution) currentEntry.institution = institution;
      if (fieldOfStudy && !currentEntry.fieldOfStudy) currentEntry.fieldOfStudy = fieldOfStudy;
      if (startYear && !currentEntry.startYear) currentEntry.startYear = startYear;
      if (endYear && !currentEntry.endYear) currentEntry.endYear = endYear;
      if (grade && !currentEntry.grade) currentEntry.grade = grade;
      if (currentStatus && !currentEntry.currentStatus) currentEntry.currentStatus = currentStatus;
      entryTextLines.push(line);
    } else if (institution) {
      // Line contains an institution without explicit degree name
      currentEntry = {
        institution,
        fieldOfStudy,
        startYear,
        endYear,
        grade,
        currentStatus,
      };
      entryTextLines.push(line);
    }
  }

  commitEntry();
  return entries;
}

/**
 * Parses raw experience lines into structured work experience and internship records.
 * Explicitly rejects academic projects, disclaimers, and generic prose.
 */
export function extractStructuredExperience(lines: string[]): IWorkExperienceEntry[] {
  const filteredLines = lines
    .map((l) => l.trim())
    .filter((l) => l && !isNoiseOrDisclaimer(l));

  if (filteredLines.length === 0) return [];

  const entries: IWorkExperienceEntry[] = [];
  let currentEntry: Partial<IWorkExperienceEntry> | null = null;
  const descriptionLines: string[] = [];
  let fullEntryRawLines: string[] = [];

  function commitEntry() {
    if (currentEntry && (currentEntry.role || currentEntry.organization)) {
      const rawText = fullEntryRawLines.join('\n');
      const description = descriptionLines.join(' ').trim();

      // Determine extraction confidence
      let confidence = 0.65;
      if (currentEntry.role && currentEntry.organization && (currentEntry.startDate || currentEntry.endDate)) {
        confidence = 0.95;
      } else if (currentEntry.role && currentEntry.organization) {
        confidence = 0.85;
      } else if (currentEntry.role || currentEntry.organization) {
        confidence = 0.70;
      }

      entries.push({
        role: currentEntry.role,
        organization: currentEntry.organization,
        employmentType: currentEntry.employmentType || 'unknown',
        startDate: currentEntry.startDate,
        endDate: currentEntry.endDate,
        isCurrent: currentEntry.isCurrent || false,
        description: description || undefined,
        rawText,
        confidence,
      });
    }
    currentEntry = null;
    descriptionLines.length = 0;
    fullEntryRawLines = [];
  }

  for (const line of filteredLines) {
    // If line is an obvious standalone project, do not classify it as employment!
    if (PROJECT_INDICATOR_REGEX.test(line) && !ROLE_TITLE_REGEX.test(line) && !COMPANY_SIGNAL_REGEX.test(line)) {
      continue;
    }

    // Check if line contains a role title
    const roleMatch = line.match(ROLE_TITLE_REGEX);
    // Check if line contains a company signal
    const companyMatch = line.match(COMPANY_SIGNAL_REGEX);
    // Check if line contains date range
    const dateMatch = line.match(DATE_RANGE_REGEX) || line.match(YEAR_RANGE_REGEX);

    const hasRole = !!roleMatch;
    const hasCompany = !!companyMatch;

    // Determine employment type
    let employmentType: IWorkExperienceEntry['employmentType'] = 'unknown';
    if (/\b(intern|internship|trainee|industrial training)\b/i.test(line)) {
      employmentType = 'internship';
    } else if (/\b(full-time|full time|permanent)\b/i.test(line)) {
      employmentType = 'full-time';
    } else if (/\b(part-time|part time)\b/i.test(line)) {
      employmentType = 'part-time';
    } else if (/\b(contract|freelance)\b/i.test(line)) {
      employmentType = 'contract';
    } else if (hasRole && !hasCompany && /intern/i.test(roleMatch ? roleMatch[0] : '')) {
      employmentType = 'internship';
    } else if (hasRole) {
      employmentType = 'full-time';
    }

    let startDate: string | undefined;
    let endDate: string | undefined;
    let isCurrent = false;

    if (dateMatch) {
      // Could be month year or just year
      if (dateMatch.length >= 5) {
        const startMonth = dateMatch[1] ? `${dateMatch[1]} ` : '';
        startDate = `${startMonth}${dateMatch[2]}`.trim();
        const endMonth = dateMatch[3] ? `${dateMatch[3]} ` : '';
        endDate = `${endMonth}${dateMatch[4]}`.trim();
      } else {
        startDate = dateMatch[1];
        endDate = dateMatch[2];
      }

      if (endDate && /present|current|ongoing/i.test(endDate)) {
        isCurrent = true;
      }
    }

    // If line has a role or company, it's candidate for entry header
    if (hasRole || hasCompany) {
      // Check if it's a new entry
      commitEntry();

      let extractedRole = roleMatch ? (roleMatch[1] || roleMatch[0]).trim() : undefined;
      let extractedOrg = companyMatch ? (companyMatch[1] || companyMatch[2] || companyMatch[0]).trim() : undefined;

      // Clean role if it includes punctuation or prefixes
      if (extractedRole) {
        extractedRole = extractedRole.replace(/^[•*\-\s]+/, '').trim();
      }
      if (extractedOrg) {
        extractedOrg = extractedOrg.replace(/^[•*\-\s]+/, '').replace(/[,|\s]+$/, '').trim();
      }

      currentEntry = {
        role: extractedRole,
        organization: extractedOrg,
        employmentType,
        startDate,
        endDate,
        isCurrent,
      };
      fullEntryRawLines.push(line);
    } else if (currentEntry) {
      // Continuation / description line
      if (!currentEntry.startDate && startDate) {
        currentEntry.startDate = startDate;
        currentEntry.endDate = endDate;
        currentEntry.isCurrent = isCurrent;
      }
      descriptionLines.push(line);
      fullEntryRawLines.push(line);
    }
  }

  commitEntry();
  return entries;
}
