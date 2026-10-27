import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { isPrHeadCurrent } from './verify-helpers';

const makeMockOctokit = (headSha: string) =>
  ({
    pulls: {
      get: async () => ({ data: { head: { sha: headSha } } }),
    },
  }) as never;

const makeFailingOctokit = (message: string) =>
  ({
    pulls: {
      get: async () => {
        throw new Error(message);
      },
    },
  }) as never;

describe('isPrHeadCurrent', () => {
  it('returns true when live HEAD matches the SHA this run tested', async () => {
    const octokit = makeMockOctokit('abc123def');
    assert.equal(await isPrHeadCurrent(octokit, 'o', 'r', '42', 'abc123def'), true);
  });

  it('returns false when live HEAD has moved past the tested SHA', async () => {
    const octokit = makeMockOctokit('newhead000');
    assert.equal(await isPrHeadCurrent(octokit, 'o', 'r', '42', 'oldhead000'), false);
  });

  it('fails open (returns false) when the PR HEAD lookup errors', async () => {
    const octokit = makeFailingOctokit('API down');
    assert.equal(await isPrHeadCurrent(octokit, 'o', 'r', '42', 'abc123def'), false);
  });
});
