/**
 * Best-effort removal of e2e-passed / e2e-failed labels from a PR.
 * A 404 on a missing label is swallowed; any other error is rethrown
 * only after both labels have been attempted.
 *
 * Required env: GITHUB_TOKEN, PR_NUMBER
 */

import { Octokit } from '@octokit/rest';

import { requireEnv } from '../utils';

import { getRepoContext } from '../shared/actions-context';
import { E2E_FAILED_LABEL, E2E_PASSED_LABEL } from '../shared/merge-pool';
import { failStep } from '../shared/output';

const main = async (): Promise<void> => {
  const octokit = new Octokit({ auth: requireEnv('GITHUB_TOKEN') });
  const { owner, repo } = getRepoContext();
  const issueNumber = Number(requireEnv('PR_NUMBER'));

  const errors: unknown[] = [];
  for (const name of [E2E_PASSED_LABEL, E2E_FAILED_LABEL]) {
    try {
      await octokit.issues.removeLabel({ issue_number: issueNumber, name, owner, repo });
      console.log(`Removed label "${name}" from PR #${issueNumber}`);
    } catch (err: unknown) {
      const status = (err as { status?: number }).status;
      if (status !== 404) {
        errors.push(err);
      }
    }
  }
  if (errors.length > 0) {
    throw errors[0];
  }
};

void main().catch((err) => {
  failStep(err instanceof Error ? err.message : String(err));
});
