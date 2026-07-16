import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Octokit } from '@octokit/rest';

import { isWriteCollaborator } from './collaborator-trust';

const fakeOctokit = (permission: string | null): Octokit =>
  ({
    repos: {
      getCollaboratorPermissionLevel: async () => {
        if (permission === null) throw new Error('Not Found');
        return { data: { permission } };
      },
    },
  }) as unknown as Octokit;

describe('isWriteCollaborator', () => {
  it('trusts a collaborator with write permission', async () => {
    const trusted = await isWriteCollaborator(
      fakeOctokit('write'),
      'kubevirt-ui',
      'kubevirt-plugin',
      'some-collaborator',
    );
    assert.equal(trusted, true);
  });

  it('trusts a collaborator with admin permission', async () => {
    const trusted = await isWriteCollaborator(
      fakeOctokit('admin'),
      'kubevirt-ui',
      'kubevirt-plugin',
      'some-admin',
    );
    assert.equal(trusted, true);
  });

  // GitHub's API collapses finer-grained roles like "maintain"/"triage"
  // into one of admin/write/read/none in the `permission` field -- a
  // "maintain" role surfaces here as "write", not as "maintain" itself.
  it('does not trust read-only permission', async () => {
    const trusted = await isWriteCollaborator(
      fakeOctokit('read'),
      'kubevirt-ui',
      'kubevirt-plugin',
      'some-reader',
    );
    assert.equal(trusted, false);
  });

  it('does not trust "none" permission', async () => {
    const trusted = await isWriteCollaborator(
      fakeOctokit('none'),
      'kubevirt-ui',
      'kubevirt-plugin',
      'random-user',
    );
    assert.equal(trusted, false);
  });

  it('fails closed when the lookup itself fails (e.g. user not a collaborator at all)', async () => {
    const trusted = await isWriteCollaborator(
      fakeOctokit(null),
      'kubevirt-ui',
      'kubevirt-plugin',
      'non-collaborator',
    );
    assert.equal(trusted, false);
  });
});
