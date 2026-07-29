/**
 * Determine whether to mark a PR's gating check stale after main advances.
 * Entry point: npx tsx src/merge/stale-mark-check.ts
 *
 * Required env: GITHUB_TOKEN, GITHUB_REPOSITORY, GITHUB_SHA,
 *               PR_NUMBER, POOL_PR_NUMBERS (JSON array)
 */

import { Octokit } from '@octokit/rest';

import { requireEnv } from '../utils';

import { getRepoContext } from '../shared/actions-context';
import { E2E_HOLD_LABEL } from '../shared/merge-pool';
import { failStep, setOutput } from '../shared/output';

const STALE_MARKER_TITLE = 'Hot Cluster E2E: stale -- main has advanced since this ran';
const STALE_MARKER_TITLE_LEGACY = 'Stale -- main has advanced since this ran';

const main = async (): Promise<void> => {
  const token = requireEnv('GITHUB_TOKEN');
  const { owner, repo } = getRepoContext();
  const prNumber = Number(requireEnv('PR_NUMBER'));
  const poolPrNumbers = JSON.parse(process.env.POOL_PR_NUMBERS ?? '[]') as number[];
  const mainSha = requireEnv('GITHUB_SHA');
  const octokit = new Octokit({ auth: token });

  const { data: pullRequest } = await octokit.pulls.get({ owner, pull_number: prNumber, repo });
  setOutput('head_sha', pullRequest.head.sha);

  const isHeld = (pullRequest.labels ?? []).some((label) => label.name === E2E_HOLD_LABEL);
  if (isHeld) {
    console.log(`PR #${prNumber} is held via /hold-e2e -- leaving its check-run alone.`);
    setOutput('should_mark', 'false');
    return;
  }

  const inPool = poolPrNumbers.includes(prNumber);
  const summary = [
    `\`main\` advanced to ${mainSha} since this check last completed.`,
    inPool
      ? 'This PR is in the merge pool -- a real retest against the new base tip has been dispatched separately.'
      : "This PR is not currently in the merge pool (needs both 'lgtm' and 'approved', no hold) -- push a commit, relabel, or comment `/retest-e2e` for a fresh result before merging.",
  ].join('\n\n');
  setOutput('summary', summary);

  const { data: existing } = await octokit.checks.listForRef({
    check_name: 'Run Gating Tests',
    owner,
    ref: pullRequest.head.sha,
    repo,
  });

  const [latest] = [...existing.check_runs].sort(
    (a, b) => new Date(b.started_at ?? '').getTime() - new Date(a.started_at ?? '').getTime(),
  );

  if (!latest) {
    console.log(
      `PR #${prNumber}: no existing "Run Gating Tests" check-run yet, nothing to mark stale.`,
    );
    setOutput('should_mark', 'false');
    return;
  }

  const isOwnStaleMarker =
    latest.output?.title === STALE_MARKER_TITLE ||
    latest.output?.title === STALE_MARKER_TITLE_LEGACY;

  if (latest.status !== 'completed' && !isOwnStaleMarker) {
    console.log(
      `PR #${prNumber}: check-run ${latest.id} is ${latest.status} from a real run -- leaving it alone.`,
    );
    setOutput('should_mark', 'false');
    return;
  }

  console.log(
    `PR #${prNumber}: marking stale (superseding check-run ${latest.id}, isOwnStaleMarker=${isOwnStaleMarker}).`,
  );
  setOutput('should_mark', 'true');
};

void main().catch((err) => {
  failStep(err instanceof Error ? err.message : String(err));
});
