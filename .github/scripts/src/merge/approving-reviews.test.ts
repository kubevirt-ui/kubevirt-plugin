import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Octokit } from '@octokit/rest';

import {
  getBranchProtectionRequirements,
  hasApprovingReview,
  isApprovingReviewMergeError,
  latestReviewsByUser,
} from './approving-reviews';
import { MERGE_GATE_CONTEXT } from './merge-gate-status';

describe('latestReviewsByUser', () => {
  it('keeps the latest review per user (case-insensitive login)', () => {
    const latest = latestReviewsByUser([
      {
        state: 'APPROVED',
        user: { login: 'Alice' },
      },
      {
        state: 'CHANGES_REQUESTED',
        user: { login: 'alice' },
      },
      {
        state: 'APPROVED',
        user: { login: 'bob' },
      },
    ] as Parameters<typeof latestReviewsByUser>[0]);

    assert.equal(latest.length, 2);
    assert.equal(
      latest.find((r) => r.user?.login?.toLowerCase() === 'alice')?.state,
      'CHANGES_REQUESTED',
    );
    assert.equal(latest.find((r) => r.user?.login === 'bob')?.state, 'APPROVED');
  });
});

describe('hasApprovingReview', () => {
  it('returns true when a latest review is APPROVED', async () => {
    const octokit = {
      paginate: {
        iterator: async function* () {
          yield {
            data: [
              { state: 'COMMENTED', user: { login: 'alice' } },
              { state: 'APPROVED', user: { login: 'bob' } },
            ],
          };
        },
      },
      pulls: { listReviews: async () => ({ data: [] }) },
    } as unknown as Octokit;

    assert.equal(await hasApprovingReview(octokit, 'o', 'r', 1), true);
  });

  it('returns false when the latest review from each user is not APPROVED', async () => {
    const octokit = {
      paginate: {
        iterator: async function* () {
          yield {
            data: [
              { state: 'APPROVED', user: { login: 'alice' } },
              { state: 'CHANGES_REQUESTED', user: { login: 'alice' } },
            ],
          };
        },
      },
      pulls: { listReviews: async () => ({ data: [] }) },
    } as unknown as Octokit;

    assert.equal(await hasApprovingReview(octokit, 'o', 'r', 1), false);
  });
});

describe('isApprovingReviewMergeError', () => {
  it('matches the GitHub protected-branch approving-review message', () => {
    assert.equal(
      isApprovingReviewMergeError(
        'At least 1 approving review is required by reviewers with write access.',
      ),
      true,
    );
  });

  it('does not match unrelated merge errors', () => {
    assert.equal(isApprovingReviewMergeError('Pull Request is not mergeable'), false);
  });
});

describe('getBranchProtectionRequirements', () => {
  it('defaults to empty checks and zero reviews on 404', async () => {
    const octokit = {
      repos: {
        getBranchProtection: async () => {
          const err = new Error('Not Found') as Error & { status: number };
          err.status = 404;
          throw err;
        },
      },
    } as unknown as Octokit;

    const result = await getBranchProtectionRequirements(octokit, 'o', 'r', 'main');
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.requiredApprovingReviewCount, 0);
      assert.equal(result.requiredChecks.size, 0);
    }
  });

  it('returns ok:false with the error message on non-404 failures', async () => {
    const octokit = {
      repos: {
        getBranchProtection: async () => {
          const err = new Error('API rate limit') as Error & { status: number };
          err.status = 403;
          throw err;
        },
      },
    } as unknown as Octokit;

    const result = await getBranchProtectionRequirements(octokit, 'o', 'r', 'release-4.23');
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.match(result.error, /Could not read branch protection for release-4\.23/);
      assert.match(result.error, /API rate limit/);
    }
  });

  it('merges contexts with checks[].context, drops Merge Gate, and reads review count', async () => {
    const octokit = {
      repos: {
        getBranchProtection: async () => ({
          data: {
            required_pull_request_reviews: { required_approving_review_count: 1 },
            required_status_checks: {
              checks: [
                { context: 'Code Checks' },
                { context: MERGE_GATE_CONTEXT },
                { context: 'Run Gating Tests' },
              ],
              contexts: ['Code Checks', 'Legacy Context'],
            },
          },
        }),
      },
    } as unknown as Octokit;

    const result = await getBranchProtectionRequirements(octokit, 'o', 'r', 'release-4.23');
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.requiredApprovingReviewCount, 1);
      assert.equal(result.requiredChecks.has(MERGE_GATE_CONTEXT), false);
      assert.deepEqual([...result.requiredChecks].sort(), [
        'Code Checks',
        'Legacy Context',
        'Run Gating Tests',
      ]);
    }
  });
});
