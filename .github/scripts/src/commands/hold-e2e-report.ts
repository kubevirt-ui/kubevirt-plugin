/**
 * /hold-e2e report — posts the hold outcome comment.
 * Entry point: npx tsx src/commands/hold-e2e-report.ts
 *
 * Required env: BOT_TOKEN, GITHUB_REPOSITORY, PR_NUMBER, LABEL_OK, MARKER_OK
 */

import { Octokit } from '@octokit/rest';

import { requireEnv } from '../utils';
import { getRepoContext, getRunUrl } from '../shared/actions-context';
import { failStep } from '../shared/output';

const main = async (): Promise<void> => {
  const token = process.env.BOT_TOKEN || requireEnv('GITHUB_TOKEN');
  const { owner, repo } = getRepoContext();
  const prNumber = Number(requireEnv('PR_NUMBER'));
  const labelOk = process.env.LABEL_OK === 'true';
  const markerOk = process.env.MARKER_OK === 'true';
  const octokit = new Octokit({ auth: token });

  const holdWorkflowUrl = `${process.env.GITHUB_SERVER_URL ?? 'https://github.com'}/${requireEnv('GITHUB_REPOSITORY')}/actions/workflows/hold-e2e.yml`;

  const body =
    labelOk && markerOk
      ? [
          '🔒 Hot Cluster E2E is now on hold for this PR.',
          '',
          'No new run will be triggered automatically (pushes, `ok-to-test`, or `main` advancing) while this hold is active, and the PR cannot merge until it is lifted.',
          '',
          'Removing the `e2e-hold` label directly does not lift the hold or refresh the result -- comment `/retest-e2e` when ready to lift it and get a fresh result.',
        ].join('\n')
      : [
          '⚠️ `/hold-e2e` only partially applied for this PR:',
          '',
          `- \`e2e-hold\` label applied: ${labelOk ? 'yes' : 'no'}`,
          `- "Run Gating Tests" marked held: ${markerOk ? 'yes' : 'no'}`,
          '',
          `See the [Actions tab](${holdWorkflowUrl}) for details, and consider re-running \`/hold-e2e\`.`,
        ].join('\n');

  try {
    await octokit.issues.createComment({ owner, repo, issue_number: prNumber, body });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`Could not comment on the PR: ${msg}`);
    failStep(
      'Failed to comment on the PR. The hold itself (the "Run Gating Tests" check-run) is unaffected.',
    );
  }
};

main().catch((err) => {
  failStep(err instanceof Error ? err.message : String(err));
});
