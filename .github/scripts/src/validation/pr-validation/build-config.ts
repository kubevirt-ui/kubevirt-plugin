import type { GitHubConfig } from '../../types/index';
import { requireEnv } from '../../utils';

/** Builds GitHubConfig from this entrypoint's expected env vars. STATUS_GITHUB_TOKEN is optional -- createStatusOctokit falls back to `token` when unset/empty. */
export const buildConfigFromEnv = (): GitHubConfig => ({
  owner: requireEnv('REPO_OWNER'),
  repo: requireEnv('REPO_NAME'),
  statusToken: process.env.STATUS_GITHUB_TOKEN || undefined,
  token: requireEnv('GITHUB_TOKEN'),
});
