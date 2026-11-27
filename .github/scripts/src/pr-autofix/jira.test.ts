import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Octokit } from '@octokit/rest';

import type { JiraIssue, JiraVersion } from '../types/index';
import { REQUIRED_COMPONENT, SKIP_LABEL } from '../types/index';
import { applyJira, pickFixVersion, planJira, runJira } from './jira';

const version = (name: string, extra: Partial<JiraVersion> = {}): JiraVersion => ({
  archived: false,
  id: name,
  name,
  released: false,
  ...extra,
});
const VERSIONS = [
  version('CNV v4.21.0', { released: true }),
  version('CNV v4.21.z'),
  version('CNV v4.22.0'),
  version('CNV v4.22.z'),
];

const issue = (fields: Partial<JiraIssue['fields']> = {}): JiraIssue =>
  ({
    fields: { components: [], fixVersions: [], ...fields },
    id: '1',
    key: 'CNV-1',
    self: '',
  }) as unknown as JiraIssue;

describe('pickFixVersion', () => {
  it('main: the unreleased non-.z version of the next release', () => {
    assert.equal(pickFixVersion(VERSIONS, '4.22', 'main')?.name, 'CNV v4.22.0');
  });

  it('release branch: prefers the .z stream', () => {
    assert.equal(pickFixVersion(VERSIONS, '4.21', 'release-4.21')?.name, 'CNV v4.21.z');
  });

  it('returns null when ambiguous or missing', () => {
    const twice = [version('CNV v4.22.0'), version('CNV 4.22 (alt)')];
    assert.equal(pickFixVersion(twice, '4.22', 'main'), null);
    assert.equal(pickFixVersion(VERSIONS, '4.30', 'main'), null);
    assert.equal(
      pickFixVersion([version('CNV v4.22.0', { archived: true })], '4.22', 'main'),
      null,
    );
  });
});

describe('planJira', () => {
  it('adds the missing Component while preserving existing ones', () => {
    const existing = [{ id: '9', name: 'Other' }];
    const plan = planJira(issue({ components: existing }), VERSIONS, '4.22', 'main');
    assert.deepEqual(plan.update.components, [{ add: { name: REQUIRED_COMPONENT } }]);
    assert.equal(plan.changes[0], `Component: \`Other\` -> \`Other, ${REQUIRED_COMPONENT}\``);
    assert.equal(plan.fields.components, undefined);
  });

  it('fills an empty Fix Version aligned to the base branch', () => {
    const components = [{ id: '1', name: REQUIRED_COMPONENT }];
    const plan = planJira(issue({ components }), VERSIONS, '4.21', 'release-4.21');
    assert.deepEqual(plan.fields.fixVersions, [{ id: 'CNV v4.21.z' }]);
    assert.deepEqual(plan.update, {});
  });

  it('never overwrites an existing Fix Version, even a mismatched one', () => {
    const components = [{ id: '1', name: REQUIRED_COMPONENT }];
    const fixVersions = [version('CNV v4.20.z')];
    const plan = planJira(issue({ components, fixVersions }), VERSIONS, '4.22', 'main');
    assert.deepEqual(plan, { changes: [], fields: {}, notes: [], update: {} });
  });

  it('leaves an ambiguous or underivable Fix Version to a human', () => {
    const components = [{ id: '1', name: REQUIRED_COMPONENT }];
    assert.equal(planJira(issue({ components }), VERSIONS, null, 'feature').notes.length, 1);
    assert.equal(
      planJira(issue({ components }), VERSIONS, '4.99', 'main').fields.fixVersions,
      undefined,
    );
  });
});

describe('applyJira', () => {
  const stub = (target: JiraIssue) => {
    const calls: unknown[][] = [];
    return {
      calls,
      client: {
        getIssue: async () => target,
        getProjectVersions: async () => VERSIONS,
        updateIssue: async (...args: unknown[]) => void calls.push(args),
      },
    };
  };

  it('updates tickets from the PR title and reports before -> after', async () => {
    const { calls, client } = stub(issue());
    const input = { baseBranch: 'main', expectedVersion: '4.22', title: 'CNV-1: fix' };
    const lines = await applyJira(client, input);
    assert.equal(calls.length, 1);
    assert.deepEqual(calls[0]?.[1], {
      fields: { fixVersions: [{ id: 'CNV v4.22.0' }] },
      update: { components: [{ add: { name: REQUIRED_COMPONENT } }] },
    });
    assert.match(lines.join('\n'), /CNV-1 Fix Version: `none` -> `CNV v4\.22\.0`/);
  });

  it('does not call Jira when nothing is missing or the title has no ticket', async () => {
    const full = issue({
      components: [{ id: '1', name: REQUIRED_COMPONENT }],
      fixVersions: [version('CNV v4.22.0')],
    });
    const { calls, client } = stub(full);
    await applyJira(client, { baseBranch: 'main', expectedVersion: '4.22', title: 'CNV-1: x' });
    const none = await applyJira(client, {
      baseBranch: 'main',
      expectedVersion: '4.22',
      title: 'x',
    });
    assert.equal(calls.length, 0);
    assert.match(none[0] ?? '', /No `CNV-XXXXX` ticket/);
  });
});

describe('runJira', () => {
  it('skips Jira when a trusted actor applied skip-jira-check', async () => {
    const octokit = {
      issues: {
        listEvents: 'listEvents',
        listLabelsOnIssue: async () => ({ data: [{ name: SKIP_LABEL }] }),
      },
      paginate: async () => [
        { actor: { login: 'openshift-ci[bot]' }, event: 'labeled', label: { name: SKIP_LABEL } },
      ],
    } as unknown as Octokit;
    const ctx = { baseBranch: 'main', owner: 'o', prNumber: 1, repo: 'r', title: 'CNV-1' };
    assert.match((await runJira(octokit, ctx))[0] ?? '', /skip-jira-check/);
  });
});
