import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Octokit } from '@octokit/rest';

import { isLabelAppliedByTrustedActor, isListedInOwners } from './owners';

const OWNERS_CONTENT = [
  'approvers:',
  '  - alice-approver',
  '  - bob-approver',
  'options:',
  '  no_parent_owners: true',
].join('\n');

const OWNERS_WITH_REVIEWERS_CONTENT = [
  'approvers:',
  '  - alice-approver',
  'reviewers:',
  '  - carol-reviewer',
  'options:',
  '  no_parent_owners: true',
].join('\n');

// Valid YAML also allows list items flush with their parent key (no
// indentation) -- a real Prow/YAML convention this repo's own OWNERS files
// don't happen to use.
const UNINDENTED_OWNERS_CONTENT = [
  'approvers:',
  '- alice-approver',
  '- bob-approver',
  'reviewers:',
  '- carol-reviewer',
].join('\n');

// A standalone comment line inside the approvers block, plus a trailing
// inline comment on a list item -- both valid YAML this repo's own OWNERS
// files don't happen to use.
const OWNERS_WITH_COMMENTS_CONTENT = [
  'approvers:',
  '  - alice-approver',
  '  # temporarily removed bob, re-add after security review',
  '  - carol-approver  # security lead',
  'reviewers:',
  '  - dave-reviewer',
].join('\n');

const fakeOctokit = (expectedPath: string, content: string | null): Octokit =>
  ({
    repos: {
      getContent: async ({ path }: { path: string }) => {
        assert.equal(path, expectedPath);
        if (content === null) {
          throw new Error('Not Found');
        }
        return { data: { content: Buffer.from(content, 'utf8').toString('base64') } };
      },
    },
  }) as unknown as Octokit;

describe('isListedInOwners', () => {
  it('defaults to .github/OWNERS when no path is given', async () => {
    const trusted = await isListedInOwners(
      fakeOctokit('.github/OWNERS', OWNERS_CONTENT),
      'kubevirt-ui',
      'kubevirt-plugin',
      'main',
      'alice-approver',
    );
    assert.equal(trusted, true);
  });

  it('reads a custom OWNERS path when given one', async () => {
    const trusted = await isListedInOwners(
      fakeOctokit('ci-scripts/OWNERS', OWNERS_CONTENT),
      'kubevirt-ui',
      'kubevirt-plugin',
      'main',
      'bob-approver',
      'ci-scripts/OWNERS',
    );
    assert.equal(trusted, true);
  });

  it('does not trust a user not listed', async () => {
    const trusted = await isListedInOwners(
      fakeOctokit('.github/OWNERS', OWNERS_CONTENT),
      'kubevirt-ui',
      'kubevirt-plugin',
      'main',
      'random-contributor',
    );
    assert.equal(trusted, false);
  });

  it('does not partially match a username that is a substring of an approver', async () => {
    const trusted = await isListedInOwners(
      fakeOctokit('.github/OWNERS', OWNERS_CONTENT),
      'kubevirt-ui',
      'kubevirt-plugin',
      'main',
      'alice',
    );
    assert.equal(trusted, false);
  });

  it('does not trust a user listed only under reviewers:, not approvers:', async () => {
    const trusted = await isListedInOwners(
      fakeOctokit('.github/OWNERS', OWNERS_WITH_REVIEWERS_CONTENT),
      'kubevirt-ui',
      'kubevirt-plugin',
      'main',
      'carol-reviewer',
    );
    assert.equal(trusted, false);
  });

  it('still trusts an approver when a reviewers: block is also present', async () => {
    const trusted = await isListedInOwners(
      fakeOctokit('.github/OWNERS', OWNERS_WITH_REVIEWERS_CONTENT),
      'kubevirt-ui',
      'kubevirt-plugin',
      'main',
      'alice-approver',
    );
    assert.equal(trusted, true);
  });

  it('matches an approver regardless of username case (GitHub logins are case-insensitive)', async () => {
    const trusted = await isListedInOwners(
      fakeOctokit('.github/OWNERS', OWNERS_CONTENT),
      'kubevirt-ui',
      'kubevirt-plugin',
      'main',
      'Alice-Approver',
    );
    assert.equal(trusted, true);
  });

  it('matches an approver listed with unindented list items', async () => {
    const trusted = await isListedInOwners(
      fakeOctokit('.github/OWNERS', UNINDENTED_OWNERS_CONTENT),
      'kubevirt-ui',
      'kubevirt-plugin',
      'main',
      'alice-approver',
    );
    assert.equal(trusted, true);
  });

  it('does not trust a reviewer listed with unindented list items', async () => {
    const trusted = await isListedInOwners(
      fakeOctokit('.github/OWNERS', UNINDENTED_OWNERS_CONTENT),
      'kubevirt-ui',
      'kubevirt-plugin',
      'main',
      'carol-reviewer',
    );
    assert.equal(trusted, false);
  });

  it('skips a standalone comment line without ending the approvers block early', async () => {
    const trusted = await isListedInOwners(
      fakeOctokit('.github/OWNERS', OWNERS_WITH_COMMENTS_CONTENT),
      'kubevirt-ui',
      'kubevirt-plugin',
      'main',
      'carol-approver',
    );
    assert.equal(trusted, true);
  });

  it('matches an approver with a trailing inline comment', async () => {
    const trusted = await isListedInOwners(
      fakeOctokit('.github/OWNERS', OWNERS_WITH_COMMENTS_CONTENT),
      'kubevirt-ui',
      'kubevirt-plugin',
      'main',
      'alice-approver',
    );
    assert.equal(trusted, true);
  });

  it('does not trust a reviewer listed after a commented approvers block', async () => {
    const trusted = await isListedInOwners(
      fakeOctokit('.github/OWNERS', OWNERS_WITH_COMMENTS_CONTENT),
      'kubevirt-ui',
      'kubevirt-plugin',
      'main',
      'dave-reviewer',
    );
    assert.equal(trusted, false);
  });

  it('fails closed when OWNERS cannot be read', async () => {
    const trusted = await isListedInOwners(
      fakeOctokit('.github/OWNERS', null),
      'kubevirt-ui',
      'kubevirt-plugin',
      'main',
      'alice-approver',
    );
    assert.equal(trusted, false);
  });
});

type FakeLabelEventsOptions = {
  events: Array<{ label: string; actor: string }>;
  ownersContent?: string | null;
};

const fakeLabelEventsOctokit = ({
  events,
  ownersContent = null,
}: FakeLabelEventsOptions): Octokit =>
  ({
    paginate: async () =>
      events.map((e) => ({
        actor: { login: e.actor },
        event: 'labeled',
        label: { name: e.label },
      })),
    issues: {
      listEvents: async () => ({ data: [] }), // unused body -- fake paginate() above ignores the method reference.
    },
    repos: {
      getContent: async () => {
        if (ownersContent === null) throw new Error('Not Found');
        return { data: { content: Buffer.from(ownersContent, 'utf8').toString('base64') } };
      },
    },
  }) as unknown as Octokit;

describe('isLabelAppliedByTrustedActor', () => {
  it('trusts the approval bot without needing an OWNERS lookup', async () => {
    const trusted = await isLabelAppliedByTrustedActor(
      fakeLabelEventsOctokit({ events: [{ actor: 'kubevirt-plugin-bot[bot]', label: 'skip' }] }),
      'kubevirt-ui',
      'kubevirt-plugin',
      1,
      'skip',
      'main',
    );
    assert.equal(trusted, true);
  });

  it('trusts an OWNERS-listed human actor', async () => {
    const trusted = await isLabelAppliedByTrustedActor(
      fakeLabelEventsOctokit({
        events: [{ actor: 'alice-approver', label: 'skip' }],
        ownersContent: OWNERS_CONTENT,
      }),
      'kubevirt-ui',
      'kubevirt-plugin',
      1,
      'skip',
      'main',
    );
    assert.equal(trusted, true);
  });

  it('does not trust a non-OWNERS actor', async () => {
    const trusted = await isLabelAppliedByTrustedActor(
      fakeLabelEventsOctokit({
        events: [{ actor: 'random-user', label: 'skip' }],
        ownersContent: OWNERS_CONTENT,
      }),
      'kubevirt-ui',
      'kubevirt-plugin',
      1,
      'skip',
      'main',
    );
    assert.equal(trusted, false);
  });

  it('does not trust an unrelated bot/app', async () => {
    const trusted = await isLabelAppliedByTrustedActor(
      fakeLabelEventsOctokit({
        events: [{ actor: 'some-other-app[bot]', label: 'skip' }],
        ownersContent: OWNERS_CONTENT,
      }),
      'kubevirt-ui',
      'kubevirt-plugin',
      1,
      'skip',
      'main',
    );
    assert.equal(trusted, false);
  });

  it('uses the most recent matching labeled event when the label was toggled multiple times', async () => {
    const trusted = await isLabelAppliedByTrustedActor(
      fakeLabelEventsOctokit({
        events: [
          { actor: 'kubevirt-plugin-bot[bot]', label: 'skip' },
          { actor: 'random-user', label: 'skip' },
        ],
        ownersContent: OWNERS_CONTENT,
      }),
      'kubevirt-ui',
      'kubevirt-plugin',
      1,
      'skip',
      'main',
    );
    assert.equal(trusted, false);
  });

  it('fails closed when no matching labeled event is found', async () => {
    const trusted = await isLabelAppliedByTrustedActor(
      fakeLabelEventsOctokit({ events: [] }),
      'kubevirt-ui',
      'kubevirt-plugin',
      1,
      'skip',
      'main',
    );
    assert.equal(trusted, false);
  });

  it('ignores events for a different label name', async () => {
    const trusted = await isLabelAppliedByTrustedActor(
      fakeLabelEventsOctokit({
        events: [{ actor: 'kubevirt-plugin-bot[bot]', label: 'reviewed' }],
      }),
      'kubevirt-ui',
      'kubevirt-plugin',
      1,
      'skip',
      'main',
    );
    assert.equal(trusted, false);
  });
});
