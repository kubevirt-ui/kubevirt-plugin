import assert from 'node:assert/strict';
import { readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, it } from 'node:test';

import type { Octokit } from '@octokit/rest';

import {
  buildForceArcReinstallReport,
  reportForceArcReinstallError,
} from './force-arc-reinstall-helpers';

type Call = { args: unknown; method: string };

const fakeOctokit = (calls: Call[]): Octokit =>
  ({
    issues: {
      createComment: async (args: unknown) => {
        calls.push({ args, method: 'createComment' });
      },
    },
  }) as unknown as Octokit;

describe('buildForceArcReinstallReport', () => {
  it('always warns about the shared-cluster impact and links the Actions tab', () => {
    const body = buildForceArcReinstallReport('kubevirt-ui', 'kubevirt-plugin', false);
    assert.match(body, /force-arc-reinstall/);
    assert.match(body, /shared\*\* cluster/);
    assert.match(
      body,
      /https:\/\/github\.com\/kubevirt-ui\/kubevirt-plugin\/actions\/workflows\/hot-cluster-e2e\.yml/,
    );
    assert.doesNotMatch(body, /previously in-progress run/);
  });

  it('notes a superseded run when one was cancelled', () => {
    const body = buildForceArcReinstallReport('kubevirt-ui', 'kubevirt-plugin', true);
    assert.match(body, /previously in-progress run/);
  });
});

describe('reportForceArcReinstallError', () => {
  const tmpFile = join(tmpdir(), `gh-output-force-arc-test-${process.pid}.txt`);
  const originalEnv = process.env.GITHUB_OUTPUT;
  const originalExit = process.exit;

  beforeEach(() => {
    writeFileSync(tmpFile, '');
    process.env.GITHUB_OUTPUT = tmpFile;
    process.exit = ((code?: number) => {
      throw new Error(`process.exit(${code})`);
    }) as never;
  });

  afterEach(() => {
    process.exit = originalExit;
    if (originalEnv === undefined) {
      delete process.env.GITHUB_OUTPUT;
    } else {
      process.env.GITHUB_OUTPUT = originalEnv;
    }
    try {
      unlinkSync(tmpFile);
    } catch {
      /* ignore */
    }
  });

  it('sets outputs, posts a comment, and fails the step', async () => {
    const calls: Call[] = [];
    const octokit = fakeOctokit(calls);

    await assert.rejects(
      () => reportForceArcReinstallError(octokit, 'o', 'r', 42, 'boom'),
      /process\.exit\(1\)/,
    );

    const output = readFileSync(tmpFile, 'utf8');
    assert.match(output, /unexpected_error=true/);
    assert.match(output, /error_message=boom/);

    assert.equal(calls.length, 1);
    assert.equal(calls[0].method, 'createComment');
    assert.deepEqual(calls[0].args, {
      body: '⚠️ `/force-arc-reinstall` hit an unexpected error:\n\n```\nboom\n```',
      issue_number: 42,
      owner: 'o',
      repo: 'r',
    });
  });

  it('still fails the step even if posting the comment itself fails', async () => {
    const octokit = {
      issues: {
        createComment: async () => {
          throw new Error('comment api down');
        },
      },
    } as unknown as Octokit;

    await assert.rejects(
      () => reportForceArcReinstallError(octokit, 'o', 'r', 42, 'boom'),
      /process\.exit\(1\)/,
    );
  });
});
