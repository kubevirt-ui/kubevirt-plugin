import type { Octokit } from '@octokit/rest';

import { addLabel } from '../../github-comments';
import { DO_NOT_MERGE_HOLD_LABEL } from '../../shared/merge-pool';
import { isListedInOwners } from '../../shared/owners';
import type { GitHubConfig } from '../../types/index';
import { isTrustedBot } from '../pr-path-validation/owners';

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

  if (isTrustedBot(sender)) {
    console.log(`Hold removal by bot ${sender} — trusted.`);
    return;
  }

  const trusted = await isListedInOwners(octokit, config.owner, config.repo, sender, 'OWNERS');
  if (trusted) {
    console.log(`Hold removal by ${sender} — trusted (root OWNERS).`);
    return;
  }

  console.log(
    `Hold removal by ${sender} is not trusted — re-applying "${DO_NOT_MERGE_HOLD_LABEL}".`,
  );
  await addLabel(octokit, config.owner, config.repo, prNumber, DO_NOT_MERGE_HOLD_LABEL);
};
