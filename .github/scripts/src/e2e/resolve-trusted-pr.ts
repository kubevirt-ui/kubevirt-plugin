/**
 * Resolve a PR's head SHA/repo and verify the workflow triggerer is listed
 * in OWNERS before any in-cluster build touches PR code. Security-critical:
 * untrusted actors must not run arbitrary PR source on self-hosted ARC runners.
 *
 * Trust subject is who triggered the run (not the PR author):
 * - UI / workflow_dispatch: GITHUB_ACTOR must be in OWNERS
 * - Bot-dispatched (e.g. /deploy-manual-console): TRIGGERED_BY is the
 *   commenter already gated by the PR command dispatcher; that login must
 *   be in OWNERS (GITHUB_ACTOR is the bot and is not listed)
 * - Re-run: GITHUB_TRIGGERING_ACTOR must be in OWNERS — never reuse the
 *   original GITHUB_ACTOR or TRIGGERED_BY from the first attempt
 *
 * Required env: GITHUB_TOKEN, GITHUB_REPOSITORY, PR_NUMBER, GITHUB_ACTOR
 * Optional env: TRIGGERED_BY (commenter login when a bot dispatches),
 *               GITHUB_TRIGGERING_ACTOR, GITHUB_RUN_ATTEMPT (set by Actions)
 *
 * Outputs: head_sha, head_repo
 * Fails the step if the triggerer is not in OWNERS.
 */

import { Octokit } from '@octokit/rest';

import { requireEnv } from '../utils';

import { getRepoContext } from '../shared/actions-context';
import { failStep, setOutput } from '../shared/output';
import { isListedInLocalOwners, resolveTrustLogin } from '../shared/owners';

const main = async (): Promise<void> => {
  const octokit = new Octokit({ auth: requireEnv('GITHUB_TOKEN') });
  const { owner, repo } = getRepoContext();
  const prNumberRaw = requireEnv('PR_NUMBER');
  const prNumber = parseInt(prNumberRaw, 10);

  if (!Number.isInteger(prNumber) || prNumber <= 0) {
    failStep(`pr-number must be a positive integer, got '${prNumberRaw}'`);
  }

  const { data: pullRequest } = await octokit.pulls.get({ owner, pull_number: prNumber, repo });

  const author = pullRequest.user?.login ?? '';
  const headSha = pullRequest.head.sha;
  const headRepo = pullRequest.head.repo
    ? pullRequest.head.repo.full_name
    : '(source repository deleted)';

  const actor = process.env.GITHUB_ACTOR ?? '';
  const triggeredBy = process.env.TRIGGERED_BY ?? '';
  const triggeringActor = process.env.GITHUB_TRIGGERING_ACTOR ?? '';
  const runAttempt = Number.parseInt(process.env.GITHUB_RUN_ATTEMPT ?? '1', 10);
  const trustLogin = resolveTrustLogin(actor, triggeredBy, {
    runAttempt: Number.isFinite(runAttempt) ? runAttempt : 1,
    triggeringActor,
  });

  console.log(`PR #${prNumber}: author=${author}, head=${headRepo}@${headSha}`);
  console.log(
    `Trust subject: ${trustLogin || '(empty)'} (actor=${actor || '(empty)'}, ` +
      `triggering_actor=${triggeringActor || '(empty)'}, triggered_by=${triggeredBy || '(none)'}, ` +
      `run_attempt=${Number.isFinite(runAttempt) ? runAttempt : 1})`,
  );

  if (!trustLogin) {
    failStep(
      'Cannot determine who triggered this workflow for the OWNERS trust check. ' +
        'Expected GITHUB_ACTOR (or TRIGGERED_BY when dispatched by a bot); ' +
        'on re-runs, GITHUB_TRIGGERING_ACTOR is required.',
    );
  }

  const trusted = isListedInLocalOwners(trustLogin);
  console.log(
    `${trustLogin} is ${trusted ? '' : 'not '}listed in OWNERS (approvers/reviewers) — ${trusted ? 'trusted' : 'untrusted'}.`,
  );

  setOutput('head_sha', headSha);
  setOutput('head_repo', headRepo);

  if (!trusted) {
    failStep(
      `'${trustLogin}' is not listed in OWNERS (approvers/reviewers). ` +
        'Only trusted repo owners can build a PR on a self-hosted runner via this workflow. ' +
        'To use this PR\'s changes anyway, push its branch to this repository directly and use the "branch" input instead.',
    );
  }
};

if (require.main === module) {
  void main().catch((err) => {
    failStep(err instanceof Error ? err.message : String(err));
  });
}
