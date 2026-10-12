import type { Octokit } from '@octokit/rest';

import { addLabel, removeLabel } from '../../github-comments';
import { APPROVED_LABEL, DO_NOT_MERGE_HOLD_LABEL, LGTM_LABEL } from '../../shared/merge-pool';

export { APPROVED_LABEL, LGTM_LABEL };
/** Label written by /hold -- blocked by isMergePoolPr via do-not-merge/* prefix. */
export const HOLD_LABEL: string = DO_NOT_MERGE_HOLD_LABEL;

const LGTM_LABEL_META = { color: '2BE239', description: 'Passed code review, ready for merge' };
const APPROVED_LABEL_META = {
  color: '0e8a16',
  description: 'Approved by an OWNERS approver, ready for merge',
};
const HOLD_LABEL_META = {
  color: 'e11d48',
  description: 'Held from merging -- comment /hold cancel to lift it',
};

export const grantLgtm = (
  octokit: Octokit,
  owner: string,
  repo: string,
  prNumber: number,
): Promise<void> => addLabel(octokit, owner, repo, prNumber, LGTM_LABEL, LGTM_LABEL_META);

export const revokeLgtm = (
  octokit: Octokit,
  owner: string,
  repo: string,
  prNumber: number,
): Promise<void> => removeLabel(octokit, owner, repo, prNumber, LGTM_LABEL);

export const grantApprove = (
  octokit: Octokit,
  owner: string,
  repo: string,
  prNumber: number,
): Promise<void> => addLabel(octokit, owner, repo, prNumber, APPROVED_LABEL, APPROVED_LABEL_META);

export const revokeApprove = (
  octokit: Octokit,
  owner: string,
  repo: string,
  prNumber: number,
): Promise<void> => removeLabel(octokit, owner, repo, prNumber, APPROVED_LABEL);

export const grantHold = (
  octokit: Octokit,
  owner: string,
  repo: string,
  prNumber: number,
): Promise<void> => addLabel(octokit, owner, repo, prNumber, HOLD_LABEL, HOLD_LABEL_META);

export const revokeHold = (
  octokit: Octokit,
  owner: string,
  repo: string,
  prNumber: number,
): Promise<void> => removeLabel(octokit, owner, repo, prNumber, HOLD_LABEL);
