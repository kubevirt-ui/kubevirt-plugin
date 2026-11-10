/**
 * Helpers for GitHub branch-protection required approving reviews.
 * Used by Auto Merge (precheck + soft-fail) and by OWNERS /lgtm bot APPROVE.
 */

import type { Octokit } from '@octokit/rest';

import { MERGE_GATE_CONTEXT } from './merge-gate-status';

type PullReview = Awaited<ReturnType<Octokit['pulls']['listReviews']>>['data'][number];

/** Latest review per user (case-insensitive login) — GitHub's merge rule. */
export const latestReviewsByUser = (reviews: PullReview[]): PullReview[] => {
  const latest = new Map<string, PullReview>();
  for (const review of reviews) {
    const login = review.user?.login;
    if (!login) {
      continue;
    }
    latest.set(login.toLowerCase(), review);
  }
  return [...latest.values()];
};

export const hasApprovingReview = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  prNumber: number,
): Promise<boolean> => {
  const reviews: PullReview[] = [];
  for await (const page of octokit.paginate.iterator(octokit.pulls.listReviews, {
    owner,
    pull_number: prNumber,
    repo,
  })) {
    reviews.push(...page.data);
  }

  return latestReviewsByUser(reviews).some((review) => review.state === 'APPROVED');
};

export const isApprovingReviewMergeError = (message: string): boolean =>
  /approving review is required/i.test(message) ||
  /at least \d+ approving review/i.test(message) ||
  /review from (code owners|required reviewers)/i.test(message);

export type BranchProtectionRequirements = {
  /** Empty when branch has no protection (404). */
  ok: true;
  requiredApprovingReviewCount: number;
  requiredChecks: Set<string>;
} | {
  error: string;
  ok: false;
};

export const getBranchProtectionRequirements = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  branch: string,
): Promise<BranchProtectionRequirements> => {
  try {
    const { data } = await octokit.repos.getBranchProtection({ branch, owner, repo });
    const contexts = data.required_status_checks?.contexts ?? [];
    const checks = data.required_status_checks?.checks?.map((c) => c.context) ?? [];
    const requiredChecks = new Set([...contexts, ...checks]);
    requiredChecks.delete(MERGE_GATE_CONTEXT);

    const requiredApprovingReviewCount =
      data.required_pull_request_reviews?.required_approving_review_count ?? 0;

    console.log(
      `Branch protection (${branch}): checks=[${[...requiredChecks].join(', ')}] ` +
        `requiredApprovingReviews=${requiredApprovingReviewCount}`,
    );

    return { ok: true, requiredApprovingReviewCount, requiredChecks };
  } catch (err: unknown) {
    const status = (err as { status?: number }).status;
    if (status === 404) {
      console.log(`No branch protection configured on ${branch} — skipping protection checks.`);
      return { ok: true, requiredApprovingReviewCount: 0, requiredChecks: new Set<string>() };
    }
    const msg = err instanceof Error ? err.message : String(err);
    return { error: `Could not read branch protection for ${branch}: ${msg}`, ok: false };
  }
};
