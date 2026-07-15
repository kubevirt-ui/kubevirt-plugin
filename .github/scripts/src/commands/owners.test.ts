import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Octokit } from '@octokit/rest';

import { isListedInAiConfigOwners } from './owners';

const OWNERS_CONTENT = [
  'approvers:',
  '  - alice-approver',
  '  - bob-approver',
  'options:',
  '  no_parent_owners: true',
].join('\n');

const fakeOctokit = (content: string | null): Octokit =>
  ({
    repos: {
      getContent: async () => {
        if (content === null) {
          throw new Error('Not Found');
        }
        return { data: { content: Buffer.from(content, 'utf8').toString('base64') } };
      },
    },
  }) as unknown as Octokit;

describe('isListedInAiConfigOwners', () => {
  it('trusts an approver listed in .github/OWNERS', async () => {
    const trusted = await isListedInAiConfigOwners(
      fakeOctokit(OWNERS_CONTENT),
      'kubevirt-ui',
      'kubevirt-plugin',
      'main',
      'alice-approver',
    );
    assert.equal(trusted, true);
  });

  it('does not trust a user not listed in .github/OWNERS', async () => {
    const trusted = await isListedInAiConfigOwners(
      fakeOctokit(OWNERS_CONTENT),
      'kubevirt-ui',
      'kubevirt-plugin',
      'main',
      'random-contributor',
    );
    assert.equal(trusted, false);
  });

  it('does not partially match a username that is a substring of an approver', async () => {
    const trusted = await isListedInAiConfigOwners(
      fakeOctokit(OWNERS_CONTENT),
      'kubevirt-ui',
      'kubevirt-plugin',
      'main',
      'alice',
    );
    assert.equal(trusted, false);
  });

  it('fails closed when .github/OWNERS cannot be read', async () => {
    const trusted = await isListedInAiConfigOwners(
      fakeOctokit(null),
      'kubevirt-ui',
      'kubevirt-plugin',
      'main',
      'alice-approver',
    );
    assert.equal(trusted, false);
  });
});
