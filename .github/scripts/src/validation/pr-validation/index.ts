import { createOctokit, getPullRequestFiles } from '../../github-repo';
import { requireEnv, safeErrorMessage } from '../../utils';
import { executeJiraValidation } from '../jira-validation/execute';
import {
  executeAiConfigValidation,
  executeCiScriptsValidation,
  executeI18nValidation,
} from '../pr-path-validation/execute';
import { buildConfigFromEnv } from './build-config';
import { clearStaleApproval } from './clear-stale-approval';
import type { PrValidationCheck } from './run-checks';
import { runChecksIsolated } from './run-checks';

export const main = async (): Promise<void> => {
  const eventAction = process.env.GITHUB_EVENT_ACTION;
  const titleChanged = process.env.TITLE_CHANGED === 'true';

  if (eventAction === 'edited' && !titleChanged) {
    console.log('Body-only edit -- title unchanged, nothing to re-validate.');
    return;
  }

  const config = buildConfigFromEnv();

  const prNumber = parseInt(requireEnv('PR_NUMBER'), 10);
  const prTitle = requireEnv('PR_TITLE');
  const baseBranch = requireEnv('BASE_BRANCH');
  const headSha = process.env.PR_HEAD_SHA;
  const prAuthor = process.env.PR_AUTHOR;

  const octokit = createOctokit(config);
  // Started once and shared (a Promise memoizes itself) between the path
  // validations, which each used to fetch this independently. Not awaited
  // here -- jira-validation doesn't need it, so a fetch failure must not
  // stop it from running; each path check awaits it inside its own isolated
  // check and surfaces the failure through runChecksIsolated if it rejects.
  const filesPromise = getPullRequestFiles(octokit, config.owner, config.repo, prNumber);

  const checks: PrValidationCheck[] = [
    {
      name: 'jira-validation',
      run: (): Promise<void> =>
        executeJiraValidation({ baseBranch, config, headSha, prNumber, prTitle }),
    },
    {
      name: 'ai-config-validation',
      run: async (): Promise<void> => {
        const files = await filesPromise;
        return executeAiConfigValidation({
          baseBranch,
          config,
          eventAction,
          files,
          prNumber,
        });
      },
    },
    {
      name: 'ci-scripts-validation',
      run: async (): Promise<void> => {
        const files = await filesPromise;
        return executeCiScriptsValidation({
          baseBranch,
          config,
          eventAction,
          files,
          prNumber,
        });
      },
    },
    {
      name: 'i18n-validation',
      run: async (): Promise<void> => {
        const files = await filesPromise;
        return executeI18nValidation({
          baseBranch,
          config,
          eventAction,
          files,
          prNumber,
        });
      },
    },
  ];

  // A new push invalidates any prior lgtm/approved -- mirrors Prow's lgtm
  // plugin. Only on synchronize: opened/reopened/edited can't carry a stale
  // review from a different diff.
  if (eventAction === 'synchronize') {
    checks.push({
      name: 'clear-stale-approval',
      run: (): Promise<void> =>
        clearStaleApproval(octokit, config.owner, config.repo, prNumber, prAuthor, baseBranch),
    });
  }

  const anyFailed = await runChecksIsolated(checks);

  if (anyFailed) {
    // Path gates already synced do-not-merge/* labels; jira-validation already
    // published its commit status. Don't fail the job — a native job failure
    // accumulates in GitHub's status rollup and permanently blocks auto-merge
    // even after labels/statuses recover.
    console.warn('One or more checks failed — see labels / jira-validation status for details.');
  }
};

if (require.main === module) {
  void main().catch((err) => {
    console.error(safeErrorMessage(err));
    process.exit(1);
  });
}
