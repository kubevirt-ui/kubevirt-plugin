/* eslint-disable */
import type { GitHubConfig } from '../../types/index';
import { requireEnv, resolveLabelWriteToken } from '../../utils';

/**
 * Builds GitHubConfig from this entrypoint's expected env vars.
 *
 * `token` prefers BOT_TOKEN (see resolveLabelWriteToken) because this config
 * drives the do-not-merge/* path-gate labels (ai-config/ci-scripts/i18n) and
 * jira-validation's do-not-merge/jira-invalid label -- clearing those via the
 * ambient GITHUB_TOKEN doesn't re-trigger auto-merge.yml, leaving "Merge
 * Gate" stale.
 *
 * STATUS_GITHUB_TOKEN is optional -- createStatusOctokit falls back to
 * `token` when unset/empty. It's wired to the ambient token explicitly in
 * pr-validation.yml so OWNERS reads stay off the bot token even though both
 * would resolve the same trust outcome.
 */
export const buildConfigFromEnv = (): GitHubConfig => ({
  owner: requireEnv('REPO_OWNER'),
  repo: requireEnv('REPO_NAME'),
  statusToken: process.env.STATUS_GITHUB_TOKEN || undefined,
  token: resolveLabelWriteToken(),
});
