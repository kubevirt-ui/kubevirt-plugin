/**
 * Post (or rewrite) the "Hot Cluster E2E Progress" commit status.
 * Uses the Commit Statuses API, not the Checks API -- commit statuses
 * always render under their own bare context name, avoiding the
 * check-suite grouping issue.
 *
 * Required env: GITHUB_TOKEN, GITHUB_REPOSITORY, GITHUB_RUN_ID,
 *               STATUS_HEAD_SHA, STATUS_CONTEXT, STATUS_STATE, STATUS_DESCRIPTION
 * Optional env: GITHUB_SERVER_URL
 */

import { Octokit } from '@octokit/rest';

import { requireEnv } from '../utils';

import { getRepoContext } from '../shared/actions-context';

const main = async (): Promise<void> => {
  const octokit = new Octokit({ auth: requireEnv('GITHUB_TOKEN') });
  const { owner, repo } = getRepoContext();
  const runId = process.env.GITHUB_RUN_ID ?? '';
  const serverUrl = process.env.GITHUB_SERVER_URL ?? 'https://github.com';

  await octokit.repos.createCommitStatus({
    context: requireEnv('STATUS_CONTEXT'),
    description: requireEnv('STATUS_DESCRIPTION'),
    owner,
    repo,
    sha: requireEnv('STATUS_HEAD_SHA'),
    state: requireEnv('STATUS_STATE') as 'failure' | 'pending' | 'success',
    target_url: `${serverUrl}/${owner}/${repo}/actions/runs/${runId}`,
  });

  console.log(
    `Posted progress status: ${process.env.STATUS_STATE} — ${process.env.STATUS_DESCRIPTION}`,
  );
};

void main().catch((err) => {
  console.warn(`Could not post progress status: ${err instanceof Error ? err.message : err}`);
});
