import type { Octokit } from '@octokit/rest';

import { addLabel } from '../../github-comments';
import { DO_NOT_MERGE_HOLD_LABEL } from '../../shared/merge-pool';
import type { GitHubConfig } from '../../types/index';
import { sameGitHubLogin } from '../../utils';
import { isWriteCollaborator } from '../commands/collaborator-trust';
import { APPROVAL_BOT_LOGIN } from '../pr-path-validation/owners';

export type VerifyHoldRemovalContext = {
  config: GitHubConfig;
  octokit: Octokit;
  prNumber: number;
  sender: string;
};

/**
 * Verify that removing do-not-merge/hold was done by a trusted actor.
 * If the sender is not trusted, re-apply the label.
 */
export const verifyMergePoolHoldRemoval = async (ctx: VerifyHoldRemovalContext): Promise<void> => {
  const { config, octokit, prNumber, sender } = ctx;

  if (sameGitHubLogin(sender, APPROVAL_BOT_LOGIN)) {
    console.log(`Hold removal by bot ${APPROVAL_BOT_LOGIN} — trusted.`);
    return;
  }

  const trusted = await isWriteCollaborator(octokit, config.owner, config.repo, sender);
  if (trusted) {
    console.log(`Hold removal by ${sender} — trusted (write collaborator).`);
    return;
  }

  console.log(
    `Hold removal by ${sender} is not trusted — re-applying "${DO_NOT_MERGE_HOLD_LABEL}".`,
  );
  await addLabel(octokit, config.owner, config.repo, prNumber, DO_NOT_MERGE_HOLD_LABEL);
};
