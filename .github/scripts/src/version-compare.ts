import type { JiraVersion } from './types/index';
import { extractVersionNumber, parseVersionToNumber } from './version-parse';

const RELEASE_BRANCH_REGEX = /^release-(\d+\.\d+)$/;
const RELEASE_SUMMARY_PREFIX_REGEX = /^\[release-\d+\.\d+\]\s*/i;

/** Extract "4.21" from "release-4.21". Returns null for non-release branches. */
export const extractVersionFromBranch = (branchName: string): null | string => {
  const match = RELEASE_BRANCH_REGEX.exec(branchName);
  return match?.[1] ?? null;
};

/** Check if a branch name matches the release-X.YY pattern. */
export const isReleaseBranch = (branchName: string): boolean =>
  RELEASE_BRANCH_REGEX.test(branchName);

/** Find the highest version among release branch names. */
export const findHighestReleaseBranchVersion = (branchNames: string[]): null | string => {
  let highest: null | string = null;
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
  const minorStr = parts[1] ?? '';
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
): null | string => {
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
  fixVersion: { name: string },
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
  const matches = versions.filter((ver) => {
    const extracted = extractVersionNumber(ver.name);
    return extracted === targetVersion && !ver.archived;
  });

  if (matches.length === 0) return null;
  if (matches.length === 1) return matches[0] ?? null;

  const zStream = matches.find((ver) => ver.name.toLowerCase().includes('.z'));
  return zStream ?? matches[0] ?? null;
};

/** Suggest target branch for a fix version (e.g., "CNV v4.21.z" => "release-4.21"). */
export const suggestBranchForFixVersion = (fixVersionName: string): null | string => {
  const version = extractVersionNumber(fixVersionName);
  if (!version) return null;
  return `release-${version}`;
};

/** Strip an existing [release-X.YY] prefix from a Jira summary. */
export const stripReleaseSummaryPrefix = (summary: string): string =>
  summary.replace(RELEASE_SUMMARY_PREFIX_REGEX, '').trim();

/** Prefix a Jira summary with [release-X.YY] derived from a fix version name (e.g., "CNV v4.21.z"). */
export const buildClonedIssueSummary = (
  originalSummary: string,
  fixVersionName: string,
): string => {
  const releaseBranch = suggestBranchForFixVersion(fixVersionName);
  const baseSummary = stripReleaseSummaryPrefix(originalSummary);
  if (!releaseBranch) return baseSummary;
  return `[${releaseBranch}] ${baseSummary}`;
};
