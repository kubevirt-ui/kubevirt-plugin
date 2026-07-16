import { requireEnv } from '../../utils';
import type { GitHubConfig } from '../../types/index';

/** Builds GitHubConfig from this entrypoint's expected env vars. STATUS_GITHUB_TOKEN is optional -- createStatusOctokit falls back to `token` when unset/empty. */
export const buildConfigFromEnv = (): GitHubConfig => ({
  token: requireEnv('GITHUB_TOKEN'),
  statusToken: process.env.STATUS_GITHUB_TOKEN || undefined,
  owner: requireEnv('REPO_OWNER'),
  repo: requireEnv('REPO_NAME'),
});
