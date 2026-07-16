/* eslint-disable no-console */
import { executeJiraValidation } from '../jira-validation/execute';
import {
  executeAiConfigValidation,
  executeCiScriptsValidation,
  reportAiConfigError,
  reportCiScriptsError,
} from '../pr-path-validation/execute';
import { buildConfigFromEnv } from './build-config';
import { clearStaleApproval } from './clear-stale-approval';
import { setCommitStatus } from '../../github-comments';
import { createOctokit, createStatusOctokit, getPullRequestFiles } from '../../github-repo';
import { runChecksIsolated } from './run-checks';
import type { PrValidationCheck } from './run-checks';
import { requireEnv, safeErrorMessage } from '../../utils';
import type { GitHubConfig } from '../../types/index';

const reportJiraUnexpectedError = async (
  config: GitHubConfig,
  headSha: string | undefined,
  err: unknown,
): Promise<void> => {
  if (!headSha) return;
  try {
    await setCommitStatus(
      createStatusOctokit(config),
      config.owner,
      config.repo,
      headSha,
      'error',
      'Jira validation encountered an unexpected error',
    );
  } catch {
    // best-effort
  }
};

const main = async (): Promise<void> => {
  const config = buildConfigFromEnv();

  const prNumber = parseInt(requireEnv('PR_NUMBER'), 10);
  const prTitle = requireEnv('PR_TITLE');
  const baseBranch = requireEnv('BASE_BRANCH');
  const headSha = process.env.PR_HEAD_SHA;
  const eventAction = process.env.GITHUB_EVENT_ACTION;

  const octokit = createOctokit(config);
  // Started once and shared (a Promise memoizes itself) between ai-config and
  // ci-scripts, which each used to fetch this independently. Not awaited
  // here -- jira-validation doesn't need it, so a fetch failure must not
  // stop it from running; ai-config/ci-scripts each await it inside their
  // own isolated check and report the failure through their normal
  // unexpected-error handling if it rejects.
  const filesPromise = getPullRequestFiles(octokit, config.owner, config.repo, prNumber);

  const checks: PrValidationCheck[] = [
    {
      name: 'jira-validation',
      run: () => executeJiraValidation({ baseBranch, config, headSha, prNumber, prTitle }),
      reportUnexpectedError: reportJiraUnexpectedError,
    },
    {
      name: 'ai-config-validation',
      run: async () => {
        const files = await filesPromise;
        return executeAiConfigValidation({
          baseBranch,
          config,
          eventAction,
          files,
          headSha,
          prNumber,
        });
      },
      reportUnexpectedError: reportAiConfigError,
    },
    {
      name: 'ci-scripts-validation',
      run: async () => {
        const files = await filesPromise;
        return executeCiScriptsValidation({
          baseBranch,
          config,
          eventAction,
          files,
          headSha,
          prNumber,
        });
      },
      reportUnexpectedError: reportCiScriptsError,
    },
  ];

  // A new push invalidates any prior lgtm/approved -- mirrors Prow's lgtm
  // plugin. Only on synchronize: opened/reopened/edited can't carry a stale
  // review from a different diff.
  if (eventAction === 'synchronize') {
    checks.push({
      name: 'clear-stale-approval',
      run: () => clearStaleApproval(octokit, config.owner, config.repo, prNumber),
      reportUnexpectedError: async (_config, _headSha, err) => {
        console.error(`Failed to clear stale lgtm/approved labels: ${safeErrorMessage(err)}`);
      },
    });
  }

  const anyFailed = await runChecksIsolated(checks, config, headSha);

  if (anyFailed) {
    process.exit(1);
  }
};

main().catch((err) => {
  console.error(safeErrorMessage(err));
  process.exit(1);
});
