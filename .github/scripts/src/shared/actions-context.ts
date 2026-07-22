import { requireEnv } from '../utils';

export type RepoContext = {
  owner: string;
  repo: string;
};

/**
 * Build { owner, repo } from the GITHUB_REPOSITORY env var.
 * Replaces `context.repo` from `actions/github-script`.
 */
export const getRepoContext = (): RepoContext => {
  const full = requireEnv('GITHUB_REPOSITORY');
  const [owner, repo] = full.split('/');
  if (!owner || !repo) {
    throw new Error(`GITHUB_REPOSITORY has unexpected format: "${full}"`);
  }
  return { owner, repo };
};

/** The current workflow run ID. */
export const getRunId = (): number => Number(requireEnv('GITHUB_RUN_ID'));

/** The current workflow run attempt number. */
export const getRunAttempt = (): number => Number(process.env.GITHUB_RUN_ATTEMPT ?? '1');

/** The event name that triggered the workflow (e.g. "pull_request_target"). */
export const getEventName = (): string => requireEnv('GITHUB_EVENT_NAME');

/** The git ref that triggered the workflow. */
export const getRef = (): string => requireEnv('GITHUB_REF');

/** The commit SHA that triggered the workflow. */
export const getSha = (): string => requireEnv('GITHUB_SHA');

/** Build the URL for a workflow run on github.com. */
export const getRunUrl = (): string => {
  const serverUrl = process.env.GITHUB_SERVER_URL ?? 'https://github.com';
  const repository = requireEnv('GITHUB_REPOSITORY');
  const runId = requireEnv('GITHUB_RUN_ID');
  return `${serverUrl}/${repository}/actions/runs/${runId}`;
};
