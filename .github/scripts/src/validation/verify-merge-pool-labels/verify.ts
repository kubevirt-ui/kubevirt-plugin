import { createRequire } from 'node:module';
import path from 'node:path';

import type { Octokit } from '@octokit/rest';

import { getPrLabelNames, removeLabel } from '../../github-comments';
import type { GitHubConfig } from '../../types/index';
import { sameGitHubLogin } from '../../utils';
import { isWriteCollaborator } from '../commands/collaborator-trust';
import { grantHold } from '../commands/review-labels';
import { APPROVAL_BOT_LOGIN, isListedInOwners } from '../pr-path-validation/owners';

const require = createRequire(__filename);
const { APPROVED_LABEL, DO_NOT_MERGE_HOLD_LABEL, LGTM_LABEL } = require(
  path.join(__dirname, '../../../../../ci-scripts/hot-cluster/js/merge-pool-labels.cjs'),
) as {
  APPROVED_LABEL: string;
  DO_NOT_MERGE_HOLD_LABEL: string;
  LGTM_LABEL: string;
};

/** Pool-facing labels whose presence must match the slash-command trust model. */
export const MERGE_POOL_WATCHED_LABELS = new Set<string>([
  LGTM_LABEL,
  APPROVED_LABEL,
  DO_NOT_MERGE_HOLD_LABEL,
]);

export type VerifyMergePoolLabelContext = {
  octokit: Octokit;
  config: GitHubConfig;
  /** Label that triggered this `labeled` event. */
  labelName: string;
  sender: string;
  baseBranch: string;
  prNumber: number;
  /** PR author -- cannot self-apply lgtm/approved via the UI either. */
  prAuthor: string;
};

export type VerifyMergePoolLabelDeps = {
  getPrLabelNames?: typeof getPrLabelNames;
  getLabelApplyingActor?: typeof getLabelApplyingActor;
};

/** Most recent actor who applied `labelName`, or undefined when the timeline has no matching labeled event. API failures propagate. */
export const getLabelApplyingActor = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  issueNumber: number,
  labelName: string,
): Promise<string | undefined> => {
  const events = await octokit.paginate(octokit.issues.listEvents, {
    issue_number: issueNumber,
    owner,
    per_page: 100,
    repo,
  });
  return events
    .filter(
      (event): event is typeof event & { label: { name?: string } } =>
        event.event === 'labeled' && 'label' in event,
    )
    .filter((event) => event.label.name === labelName)
    .at(-1)?.actor?.login;
};

/**
 * Same trust rules as /lgtm, /approve, /hold -- bot exempt so command/review
 * paths that already checked trust aren't stripped when the bot adds the label.
 */
export const isTrustedMergePoolLabelActor = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  baseBranch: string,
  labelName: string,
  actor: string,
  prAuthor: string,
): Promise<boolean> => {
  if (actor === APPROVAL_BOT_LOGIN) return true;

  if (labelName === LGTM_LABEL) {
    if (sameGitHubLogin(actor, prAuthor)) return false;
    return isWriteCollaborator(octokit, owner, repo, actor);
  }

  if (labelName === APPROVED_LABEL) {
    if (sameGitHubLogin(actor, prAuthor)) return false;
    return isListedInOwners(octokit, owner, repo, baseBranch, actor, 'OWNERS');
  }

  if (labelName === DO_NOT_MERGE_HOLD_LABEL) {
    return isWriteCollaborator(octokit, owner, repo, actor);
  }

  return false;
};

/**
 * Strips untrusted lgtm/approved/do-not-merge/hold labels. Reconciles every
 * watched pool label currently on the PR so a concurrent `labeled` event
 * cannot leave an untrusted label behind. Label-list and timeline API
 * failures propagate -- never proceed with partial/incomplete reads.
 */
export const verifyMergePoolLabel = async (
  ctx: VerifyMergePoolLabelContext,
  deps: VerifyMergePoolLabelDeps = {},
): Promise<void> => {
  const listLabels = deps.getPrLabelNames ?? getPrLabelNames;
  const resolveActor = deps.getLabelApplyingActor ?? getLabelApplyingActor;

  const current = await listLabels(ctx.octokit, ctx.config.owner, ctx.config.repo, ctx.prNumber);
  const labelsToCheck = [...MERGE_POOL_WATCHED_LABELS].filter((name) => current.has(name));

  if (labelsToCheck.length === 0) {
    // eslint-disable-next-line no-console
    console.log(
      `No watched merge-pool labels present on PR #${ctx.prNumber} -- nothing to verify.`,
    );
    return;
  }

  for (const labelName of labelsToCheck) {
    // Triggering label: trust the webhook sender (handles the bot-apply race
    // where the timeline may not yet show the labeled event). Other watched
    // labels already on the PR: look up the applying actor via the timeline.
    const actor =
      labelName === ctx.labelName
        ? ctx.sender
        : await resolveActor(
            ctx.octokit,
            ctx.config.owner,
            ctx.config.repo,
            ctx.prNumber,
            labelName,
          );

    const trusted =
      actor !== undefined &&
      (await isTrustedMergePoolLabelActor(
        ctx.octokit,
        ctx.config.owner,
        ctx.config.repo,
        ctx.baseBranch,
        labelName,
        actor,
        ctx.prAuthor,
      ));

    // eslint-disable-next-line no-console
    console.log(
      trusted
        ? `"${labelName}" applied by ${actor} is trusted -- leaving in place.`
        : `"${labelName}" applied by ${actor ?? 'unknown'} is not trusted -- stripping.`,
    );

    if (trusted) continue;

    await removeLabel(ctx.octokit, ctx.config.owner, ctx.config.repo, ctx.prNumber, labelName);
  }
};

export type VerifyHoldRemovalContext = {
  octokit: Octokit;
  config: GitHubConfig;
  sender: string;
  prNumber: number;
};

/**
 * On unlabeled do-not-merge/hold: restore the label unless the remover is the
 * approval bot or a write-access collaborator (same gate as /hold cancel).
 */
export const verifyMergePoolHoldRemoval = async (ctx: VerifyHoldRemovalContext): Promise<void> => {
  if (ctx.sender === APPROVAL_BOT_LOGIN) {
    // eslint-disable-next-line no-console
    console.log(
      `do-not-merge/hold removed by ${ctx.sender} -- trusted (/hold cancel or bot); leaving removed.`,
    );
    return;
  }

  const collaborator = await isWriteCollaborator(
    ctx.octokit,
    ctx.config.owner,
    ctx.config.repo,
    ctx.sender,
  );
  if (collaborator) {
    // eslint-disable-next-line no-console
    console.log(
      `do-not-merge/hold removed by write collaborator ${ctx.sender} -- leaving removed.`,
    );
    return;
  }

  // eslint-disable-next-line no-console
  console.log(`do-not-merge/hold removed by untrusted ${ctx.sender} -- restoring the label.`);
  await grantHold(ctx.octokit, ctx.config.owner, ctx.config.repo, ctx.prNumber);
};
