import type { ClonedTicket } from './types/index';
import { JIRA_BASE_URL } from './types/index';

/** Extract all CNV-XXXXX ticket IDs from a PR title. */
export const extractTicketIds = (title: string): string[] => {
  const matches = title.match(/CNV-\d+/gi);
  if (!matches) return [];
  return [...new Set(matches.map((match) => match.toUpperCase()))];
};

/** Extract the first "X.YY" version number from any string (e.g., "CNV v4.21.z" => "4.21"). */
export const extractVersionNumber = (text: string): null | string => {
  const match = /(\d+\.\d+)/.exec(text);
  return match?.[1] ?? null;
};

/** Convert "4.21" to a comparable integer for sorting. */
export const parseVersionToNumber = (version: string): number => {
  const [major, minor] = version.split('.').map(Number);
  return (major ?? 0) * 100000 + (minor ?? 0);
};

const JIRA_ISSUE_KEY_PATTERN = /^[A-Z][A-Z0-9]+-\d+$/;

/** Validate Jira issue keys before using them in string operations. */
export const isValidJiraIssueKey = (key: string): boolean => JIRA_ISSUE_KEY_PATTERN.test(key);

/** Linear-time case-insensitive literal replacement (avoids dynamic RegExp / ReDoS). */
export const replaceLiteralCaseInsensitive = (
  text: string,
  search: string,
  replacement: string,
): string => {
  if (!search) return text;

  const searchLower = search.toLowerCase();
  let result = '';
  let index = 0;

  while (index < text.length) {
    const candidate = text.slice(index, index + search.length);
    if (candidate.length === search.length && candidate.toLowerCase() === searchLower) {
      result += replacement;
      index += search.length;
    } else {
      result += text[index];
      index += 1;
    }
  }

  return result;
};

const isJiraKeyChar = (char: string | undefined): boolean =>
  char !== undefined && /[A-Z0-9]/i.test(char);

/** Remove whole Jira key occurrences using literal matching (avoids dynamic RegExp / ReDoS). */
export const removeJiraKeyOccurrences = (text: string, key: string): string => {
  if (!isValidJiraIssueKey(key)) return text;

  const keyLower = key.toLowerCase();
  let result = '';
  let index = 0;

  while (index < text.length) {
    const candidate = text.slice(index, index + key.length);
    const before = index > 0 ? text[index - 1] : undefined;
    const after = text[index + key.length];

    if (
      candidate.length === key.length &&
      candidate.toLowerCase() === keyLower &&
      !isJiraKeyChar(before) &&
      !isJiraKeyChar(after)
    ) {
      index += key.length;
    } else {
      result += text[index];
      index += 1;
    }
  }

  return result;
};

/** Replace original Jira keys with clone keys (e.g. in cherry-picked commit messages). */
export const rewriteJiraKeysInText = (text: string, clonedTickets: ClonedTicket[]): string => {
  let result = text;
  for (const { clonedKey, originalKey } of clonedTickets) {
    if (!isValidJiraIssueKey(originalKey) || !isValidJiraIssueKey(clonedKey)) {
      continue;
    }
    result = replaceLiteralCaseInsensitive(result, originalKey, clonedKey);
  }
  return result;
};

/** Remove original Jira keys from text so Prow does not update the source ticket. */
export const stripOriginalJiraKeys = (text: string, clonedTickets: ClonedTicket[]): string => {
  let result = text;
  for (const { originalKey } of clonedTickets) {
    if (!isValidJiraIssueKey(originalKey)) {
      continue;
    }

    const markdownLink = `[${originalKey}](${JIRA_BASE_URL}/browse/${originalKey})`;
    result = replaceLiteralCaseInsensitive(result, markdownLink, '');
    result = replaceLiteralCaseInsensitive(result, `${JIRA_BASE_URL}/browse/${originalKey}`, '');
    result = removeJiraKeyOccurrences(result, originalKey);
  }
  return result.replace(/\n{3,}/g, '\n\n').trim();
};
