import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { fetchPr } from './fetch-pr';

const makeMockOctokit = (pullData: Record<string, unknown>) =>
  ({
    pulls: {
      get: async () => ({ data: pullData }),
    },
  }) as never;

describe('fetchPr', () => {
  it('returns normalized PR details', async () => {
    const octokit = makeMockOctokit({
      base: { ref: 'main' },
      head: { sha: 'abc123', repo: { full_name: 'owner/repo' } },
      labels: [{ name: 'lgtm' }],
      merge_commit_sha: 'def456',
      node_id: 'node1',
      number: 42,
      title: 'CNV-12345: Fix something',
      user: { login: 'test-user' },
    });

    const result = await fetchPr(octokit, 'owner', 'repo', 42);

    assert.equal(result.number, 42);
    assert.equal(result.title, 'CNV-12345: Fix something');
    assert.equal(result.baseRef, 'main');
    assert.equal(result.headSha, 'abc123');
    assert.equal(result.mergeCommitSha, 'def456');
    assert.equal(result.author, 'test-user');
  });

  it('handles missing merge_commit_sha', async () => {
    const octokit = makeMockOctokit({
      base: { ref: 'release-4.21' },
      head: { sha: 'abc123', repo: null },
      labels: [],
      merge_commit_sha: null,
      node_id: '',
      number: 7,
      title: 'backport',
      user: { login: 'author' },
    });

    const result = await fetchPr(octokit, 'owner', 'repo', 7);
    assert.equal(result.mergeCommitSha, '');
  });

  it('handles missing user', async () => {
    const octokit = makeMockOctokit({
      base: { ref: 'main' },
      head: { sha: 'sha1', repo: null },
      labels: [],
      merge_commit_sha: 'sha2',
      node_id: '',
      number: 1,
      title: 'title',
      user: null,
    });

    const result = await fetchPr(octokit, 'o', 'r', 1);
    assert.equal(result.author, '');
  });
});
