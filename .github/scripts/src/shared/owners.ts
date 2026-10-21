import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { type Octokit } from '@octokit/rest';

type OwnersData = {
  approvers: string[];
  reviewers: string[];
};

/**
 * Repo-root OWNERS path. Scripts usually run with cwd `.github/scripts`, so a
 * bare relative `OWNERS` would miss the real file; prefer GITHUB_WORKSPACE.
 */
export const getLocalOwnersPath = (ownersFile = 'OWNERS'): string =>
  resolve(process.env.GITHUB_WORKSPACE ?? resolve(process.cwd(), '../..'), ownersFile);

export type ResolveTrustLoginOptions = {
  /** GITHUB_TRIGGERING_ACTOR — who clicked Re-run when attempt > 1. */
  triggeringActor?: string;
  /** GITHUB_RUN_ATTEMPT — 1 for the initial run, >1 for re-runs. */
  runAttempt?: number;
};

/**
 * Who to check against OWNERS for a workflow run.
 * - Normal run: bot dispatches use triggeredBy (commenter); human UI dispatch
 *   uses GITHUB_ACTOR and ignores triggeredBy so callers cannot spoof trust.
 * - Re-run (runAttempt > 1): always use GITHUB_TRIGGERING_ACTOR. Never reuse
 *   the original TRIGGERED_BY / GITHUB_ACTOR — a non-owner must not inherit
 *   an owner-authorized deployment by clicking Re-run.
 */
export const resolveTrustLogin = (
  actor: string,
  triggeredBy: string,
  options: ResolveTrustLoginOptions = {},
): string => {
  const runAttempt = options.runAttempt ?? 1;
  if (runAttempt > 1) {
    return options.triggeringActor ?? '';
  }
  if (actor.endsWith('[bot]') && triggeredBy) {
    return triggeredBy;
  }
  return actor;
};

/**
 * Parse an OWNERS file (Kubernetes-style YAML with approvers/reviewers lists).
 * Uses regex rather than a YAML parser to avoid adding a dependency.
 */
export const parseOwnersFile = (content: string): OwnersData => {
  const result: OwnersData = { approvers: [], reviewers: [] };

  const lines = content.split('\n');
  const sectionState = { current: null as 'approvers' | 'reviewers' | null };

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed === 'approvers:') {
      sectionState.current = 'approvers';
      continue;
    }
    if (trimmed === 'reviewers:') {
      sectionState.current = 'reviewers';
      continue;
    }

    if (sectionState.current && trimmed.startsWith('- ')) {
      const name = trimmed.slice(2).trim();
      if (name) {
        result[sectionState.current].push(name);
      }
      continue;
    }

    if (sectionState.current && !trimmed.startsWith('#') && trimmed !== '') {
      sectionState.current = null;
    }
  }

  return result;
};

/**
 * Check whether a GitHub login is listed in the local OWNERS file.
 * Reads from the filesystem (assumes the repo is checked out).
 * Defaults to the repo-root OWNERS via GITHUB_WORKSPACE (not cwd).
 */
export const isListedInLocalOwners = (
  login: string,
  ownersPath: string = getLocalOwnersPath(),
): boolean => {
  try {
    const content = readFileSync(ownersPath, 'utf8');
    const owners = parseOwnersFile(content);
    const lower = login.toLowerCase();
    return (
      owners.approvers.some((approver) => approver.toLowerCase() === lower) ||
      owners.reviewers.some((reviewer) => reviewer.toLowerCase() === lower)
    );
  } catch {
    return false;
  }
};

/**
 * Check whether a GitHub login is listed in OWNERS via the GitHub API.
 * Fetches the file from the default branch (secure -- PR can't self-approve).
 */
export const isListedInOwners = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  login: string,
  ownersPath = 'OWNERS',
  ref?: string,
): Promise<boolean> => {
  try {
    const { data } = await octokit.repos.getContent({
      owner,
      path: ownersPath,
      repo,
      ...(ref ? { ref } : {}),
    });

    if ('content' in data && data.content) {
      const content = Buffer.from(data.content, 'base64').toString('utf8');
      const owners = parseOwnersFile(content);
      const lower = login.toLowerCase();
      return (
        owners.approvers.some((approver) => approver.toLowerCase() === lower) ||
        owners.reviewers.some((reviewer) => reviewer.toLowerCase() === lower)
      );
    }
    return false;
  } catch {
    return false;
  }
};
