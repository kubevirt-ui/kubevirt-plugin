import { JIRA_BASE_URL } from './types/index.js';
import type { ClonedTicket, JiraVersion } from './types/index.js';

const RELEASE_BRANCH_REGEX = /^release-(\d+\.\d+)$/;
const VERSION_NUMBER_REGEX = /(\d+\.\d+)/;

/** Extract "4.21" from "release-4.21". Returns null for non-release branches. */
export const extractVersionFromBranch = (branchName: string): string | null => {
  const match = branchName.match(RELEASE_BRANCH_REGEX);
  return match?.[1] ?? null;
};

/** Extract the first "X.YY" version number from any string (e.g., "CNV v4.21.z" => "4.21"). */
export const extractVersionNumber = (text: string): string | null => {
  const match = text.match(VERSION_NUMBER_REGEX);
  return match?.[1] ?? null;
};

/** Convert "4.21" to a comparable integer for sorting. */
const parseVersionToNumber = (version: string): number => {
  const [major, minor] = version.split('.').map(Number);
  return (major ?? 0) * 100000 + (minor ?? 0);
};

/** Find the highest version among release branch names. */
export const findHighestReleaseBranchVersion = (branchNames: string[]): string | null => {
  let highest: string | null = null;
  let highestNumeric = 0;

  for (const name of branchNames) {
    const version = extractVersionFromBranch(name);
    if (!version) continue;

    const numeric = parseVersionToNumber(version);
    if (numeric > highestNumeric) {
      highestNumeric = numeric;
      highest = version;
    }
  }

  return highest;
};

/** Increment minor version. Preserves zero-padding (5.03 => 5.04). */
export const computeNextVersion = (highestReleaseVersion: string): string => {
  const parts = highestReleaseVersion.split('.');
  const major = parts[0];
  const minorStr = parts[1]!;
  const nextMinor = parseInt(minorStr, 10) + 1;
  const padded =
    minorStr.length > 1 && minorStr.startsWith('0')
      ? String(nextMinor).padStart(minorStr.length, '0')
      : String(nextMinor);
  return `${major}.${padded}`;
};

/** Get the expected fix version number for a branch ("main" => next version, "release-X.YY" => "X.YY"). */
export const getExpectedVersionForBranch = (
  baseBranch: string,
  releaseBranches: string[],
): string | null => {
  const releaseVersion = extractVersionFromBranch(baseBranch);
  if (releaseVersion) return releaseVersion;

  if (baseBranch === 'main') {
    const highest = findHighestReleaseBranchVersion(releaseBranches);
    if (!highest) return null;
    return computeNextVersion(highest);
  }

  return null;
};

/** Check if a Jira fix version's embedded number matches an expected version. */
export const fixVersionMatchesBranch = (
  fixVersion: JiraVersion,
  expectedVersion: string,
): boolean => {
  const fvVersion = extractVersionNumber(fixVersion.name);
  return fvVersion === expectedVersion;
};

/** Find the best matching Jira fix version for a target version. Prefers ".z" stream versions. */
export const findMatchingFixVersion = (
  versions: JiraVersion[],
  targetVersion: string,
): JiraVersion | null => {
  const matches = versions.filter((v) => {
    const extracted = extractVersionNumber(v.name);
    return extracted === targetVersion && !v.archived;
  });

  if (matches.length === 0) return null;
  if (matches.length === 1) return matches[0]!;

  const zStream = matches.find((v) => v.name.toLowerCase().includes('.z'));
  return zStream ?? matches[0]!;
};

/** Suggest target branch for a fix version (e.g., "CNV v4.21.z" => "release-4.21"). */
export const suggestBranchForFixVersion = (fixVersionName: string): string | null => {
  const version = extractVersionNumber(fixVersionName);
  if (!version) return null;
  return `release-${version}`;
};

/** Extract all CNV-XXXXX ticket IDs from a PR title. */
export const extractTicketIds = (title: string): string[] => {
  const matches = title.match(/CNV-\d+/gi);
  if (!matches) return [];
  return [...new Set(matches.map((m) => m.toUpperCase()))];
};

/** Replace original Jira keys with clone keys (e.g. in cherry-picked commit messages). */
export const rewriteJiraKeysInText = (text: string, clonedTickets: ClonedTicket[]): string => {
  let result = text;
  for (const { originalKey, clonedKey } of clonedTickets) {
    result = result.replace(new RegExp(originalKey, 'gi'), clonedKey);
  }
  return result;
};

/** Remove original Jira keys from text so Prow does not update the source ticket. */
export const stripOriginalJiraKeys = (text: string, clonedTickets: ClonedTicket[]): string => {
  let result = text;
  for (const { originalKey } of clonedTickets) {
    result = result.replace(new RegExp(`\\[${originalKey}\\]\\([^)]*\\)`, 'gi'), '');
    result = result.replace(new RegExp(`${JIRA_BASE_URL}/browse/${originalKey}`, 'gi'), '');
    result = result.replace(new RegExp(`\\b${originalKey}\\b`, 'gi'), '');
  }
  return result.replace(/\n{3,}/g, '\n\n').trim();
};

/** Check if a branch name matches the release-X.YY pattern. */
export const isReleaseBranch = (branchName: string): boolean =>
  RELEASE_BRANCH_REGEX.test(branchName);
