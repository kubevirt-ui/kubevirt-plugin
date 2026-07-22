import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, it } from 'node:test';

import { setOutput, addStepSummary } from './output';

describe('setOutput', () => {
  const tmpFile = join(tmpdir(), `gh-output-test-${process.pid}.txt`);
  const originalEnv = process.env.GITHUB_OUTPUT;

  beforeEach(() => {
    writeFileSync(tmpFile, '');
    process.env.GITHUB_OUTPUT = tmpFile;
  });

  afterEach(() => {
    if (originalEnv === undefined) delete process.env.GITHUB_OUTPUT;
    else process.env.GITHUB_OUTPUT = originalEnv;
    try {
      unlinkSync(tmpFile);
    } catch {
      /* ignore */
    }
  });

  it('writes single-line value as key=value', () => {
    setOutput('result', 'success');
    const content = readFileSync(tmpFile, 'utf8');
    assert.equal(content, 'result=success\n');
  });

  it('writes multiline value using heredoc delimiter syntax', () => {
    setOutput('summary', 'line1\nline2\nline3');
    const content = readFileSync(tmpFile, 'utf8');

    const lines = content.split('\n');
    assert.match(lines[0], /^summary<<ghadelim_/);
    assert.equal(lines[1], 'line1');
    assert.equal(lines[2], 'line2');
    assert.equal(lines[3], 'line3');
    const delim = lines[0].replace('summary<<', '');
    assert.equal(lines[4], delim);
  });

  it('appends multiple outputs to the same file', () => {
    setOutput('a', '1');
    setOutput('b', '2');
    const content = readFileSync(tmpFile, 'utf8');
    assert.equal(content, 'a=1\nb=2\n');
  });

  it('throws when GITHUB_OUTPUT is not set', () => {
    delete process.env.GITHUB_OUTPUT;
    assert.throws(() => setOutput('key', 'value'), /GITHUB_OUTPUT is not set/);
  });

  it('handles empty string value', () => {
    setOutput('empty', '');
    const content = readFileSync(tmpFile, 'utf8');
    assert.equal(content, 'empty=\n');
  });

  it('handles value with special characters', () => {
    setOutput('special', 'value with "quotes" and `backticks`');
    const content = readFileSync(tmpFile, 'utf8');
    assert.equal(content, 'special=value with "quotes" and `backticks`\n');
  });
});

describe('addStepSummary', () => {
  const tmpFile = join(tmpdir(), `gh-summary-test-${process.pid}.txt`);
  const originalEnv = process.env.GITHUB_STEP_SUMMARY;

  beforeEach(() => {
    writeFileSync(tmpFile, '');
    process.env.GITHUB_STEP_SUMMARY = tmpFile;
  });

  afterEach(() => {
    if (originalEnv === undefined) delete process.env.GITHUB_STEP_SUMMARY;
    else process.env.GITHUB_STEP_SUMMARY = originalEnv;
    try {
      unlinkSync(tmpFile);
    } catch {
      /* ignore */
    }
  });

  it('appends markdown to the summary file', () => {
    addStepSummary('## Results\n- passed');
    const content = readFileSync(tmpFile, 'utf8');
    assert.equal(content, '## Results\n- passed\n');
  });

  it('is a no-op when GITHUB_STEP_SUMMARY is not set', () => {
    delete process.env.GITHUB_STEP_SUMMARY;
    addStepSummary('should not throw');
  });
});
