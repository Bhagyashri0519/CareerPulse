import { CANONICAL_SKILLS_TAXONOMY, CanonicalSkillDefinition } from '../taxonomy.data';
import { ExtractedSections } from '../extractors/section.detector';

export interface ClaimedSkillResult {
  canonicalId: string;
  name: string;
  category: string;
  matchedAlias: string;
  confidence: number;
  contextSnippet: string;
  isImported: boolean;
}

/**
 * Escapes regex special characters in a string.
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Builds a boundary-safe regular expression for an alias.
 * Handles cases with punctuation like 'React.js', 'Node.js', 'HTML/CSS'.
 */
function buildAliasRegex(alias: string): RegExp {
  const escaped = escapeRegex(alias);
  // Match alias preceded and followed by non-word characters or string boundaries
  return new RegExp(`(?:^|[^a-zA-Z0-9_])(${escaped})(?:[^a-zA-Z0-9_]|$)`, 'i');
}

/**
 * Extracts a clean context snippet strictly bounded within a single section line.
 * Never crosses section boundaries, line breaks, or adjacent headings.
 */
function extractLineSnippet(line: string, alias: string): string {
  const cleanLine = line.replace(/[\r\n]+/g, ' ').trim();
  const lowerLine = cleanLine.toLowerCase();
  const lowerAlias = alias.toLowerCase();
  const matchIndex = lowerLine.indexOf(lowerAlias);

  // If the line is short enough, return the entire clean line
  if (cleanLine.length <= 110) {
    return cleanLine;
  }

  // Otherwise, extract a focused snippet strictly bounded within this line
  const radius = 35;
  const start = Math.max(0, matchIndex >= 0 ? matchIndex - radius : 0);
  const end = Math.min(cleanLine.length, (matchIndex >= 0 ? matchIndex + alias.length : 0) + radius);

  let snippet = cleanLine.slice(start, end).trim();
  if (start > 0) snippet = `...${snippet}`;
  if (end < cleanLine.length) snippet = `${snippet}...`;
  return snippet;
}

/**
 * Extracts a clean context snippet bounded strictly within the line containing the match in rawText.
 * Guaranteed never to bleed across newlines into preceding or subsequent section headers.
 */
function extractLineBoundedSnippetFromRaw(
  text: string,
  matchIndex: number,
  matchLength: number,
): string {
  const lineStart = Math.max(0, text.lastIndexOf('\n', matchIndex) + 1);
  let lineEnd = text.indexOf('\n', matchIndex + matchLength);
  if (lineEnd === -1) lineEnd = text.length;

  const line = text.slice(lineStart, lineEnd).replace(/[\r\n]+/g, ' ').trim();
  if (line.length <= 110) {
    return line;
  }

  const relativeMatch = matchIndex - lineStart;
  const radius = 35;
  const start = Math.max(0, relativeMatch - radius);
  const end = Math.min(line.length, relativeMatch + matchLength + radius);

  let snippet = line.slice(start, end).trim();
  if (start > 0) snippet = `...${snippet}`;
  if (end < line.length) snippet = `${snippet}...`;
  return snippet;
}

/**
 * Deterministically extracts and normalizes canonical skills from resume text.
 * De-duplicates multiple mentions of the same canonical skill.
 */
export function normalizeSkillsFromText(
  rawText: string,
  sections?: ExtractedSections,
): ClaimedSkillResult[] {
  const matchedSkillsMap = new Map<string, ClaimedSkillResult>();

  const skillsSectionText = sections?.skills ? sections.skills.join(' ') : '';
  const experienceSectionText = sections?.experience ? sections.experience.join(' ') : '';
  const projectsSectionText = sections?.projects ? sections.projects.join(' ') : '';

  for (const skillDef of CANONICAL_SKILLS_TAXONOMY) {
    // Sort aliases by length descending so more specific matches (e.g. 'React.js') match before 'React'
    const sortedAliases = [...skillDef.aliases].sort((a, b) => b.length - a.length);

    for (const alias of sortedAliases) {
      // Avoid false positive matching of 2-letter aliases ('TS', 'JS', 'ML') if they appear in isolation
      // without word boundaries or within common abbreviations
      const isShortAcronym = alias.length <= 2;
      const regex = isShortAcronym
        ? new RegExp(`\\b(${escapeRegex(alias)})\\b`, '') // case-sensitive for short acronyms like 'JS', 'TS', 'ML'
        : buildAliasRegex(alias);

      const match = rawText.match(regex);
      if (match && match.index !== undefined) {
        // Compute matched text position
        const matchedAliasStr = match[1] || match[0].trim();

        // Find the best section line for the context snippet so it never bleeds into adjacent sections
        let snippet = '';
        if (sections) {
          const sectionCandidates = [
            ...(sections.skills || []),
            ...(sections.projects || []),
            ...(sections.experience || []),
            ...(sections.certifications || []),
            ...(sections.education || []),
          ];

          for (const secLine of sectionCandidates) {
            if (regex.test(secLine)) {
              snippet = extractLineSnippet(secLine, matchedAliasStr);
              break;
            }
          }
        }

        // Fallback to line-bounded snippet in rawText if not found in section lines
        if (!snippet) {
          const aliasIndex = rawText.indexOf(matchedAliasStr, match.index);
          snippet = extractLineBoundedSnippetFromRaw(
            rawText,
            aliasIndex >= 0 ? aliasIndex : match.index,
            matchedAliasStr.length,
          );
        }

        // Heuristic matching confidence score based on where the alias appears
        let confidence = 0.75;
        if (skillsSectionText && buildAliasRegex(alias).test(skillsSectionText)) {
          confidence = 0.95;
        } else if (
          (projectsSectionText && buildAliasRegex(alias).test(projectsSectionText)) ||
          (experienceSectionText && buildAliasRegex(alias).test(experienceSectionText))
        ) {
          confidence = 0.85;
        }

        const existing = matchedSkillsMap.get(skillDef.canonicalId);
        if (!existing || confidence > existing.confidence) {
          matchedSkillsMap.set(skillDef.canonicalId, {
            canonicalId: skillDef.canonicalId,
            name: skillDef.name,
            category: skillDef.category,
            matchedAlias: matchedAliasStr,
            confidence,
            contextSnippet: snippet,
            isImported: false,
          });
        }
        break; // Matched the most specific alias for this canonical skill
      }
    }
  }

  return Array.from(matchedSkillsMap.values());
}
