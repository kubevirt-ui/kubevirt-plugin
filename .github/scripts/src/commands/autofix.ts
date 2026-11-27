/**
 * /autofix -- dispatch the PR Autofix workflow for this PR.
 *
 * Root-OWNERS trust is enforced by the dispatcher (requiresTrust) and re-checked by the
 * workflow's apply job, so a spoofed `triggered_by` input is never believed on its own.
 */

import { reactToComment } from '../shared/command-helpers';
import { dispatchWorkflow } from '../shared/dispatch';
import type { CommandContext } from './command-registry';

export const AUTOFIX_WORKFLOW_FILE = 'pr-autofix.yml';

export const executeAutofix = async (ctx: CommandContext): Promise<void> => {
  const { author, commentId, octokit, owner, prNumber, repo } = ctx;

  await dispatchWorkflow(octokit, {
    inputs: { pr_number: String(prNumber), triggered_by: author },
    owner,
    ref: 'main',
    repo,
    workflowId: AUTOFIX_WORKFLOW_FILE,
  });
  await reactToComment(octokit, owner, repo, commentId, 'rocket');
  console.log(`Dispatched ${AUTOFIX_WORKFLOW_FILE} for PR #${prNumber}.`);
};
