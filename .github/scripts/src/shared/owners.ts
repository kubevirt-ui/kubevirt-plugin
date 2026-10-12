import { readFileSync } from 'node:fs';

import { type Octokit } from '@octokit/rest';

type OwnersData = {
  approvers: string[];
  reviewers: string[];
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
 */
export const isListedInLocalOwners = (login: string, ownersPath = 'OWNERS'): boolean => {
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
