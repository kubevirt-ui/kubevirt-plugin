import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { mapResultDetails } from './result-mapper';

const baseParams = {
  prNumber: '123',
  mainSha: 'abc123',
  isPoolRetest: false,
  held: false,
  testFailureSummary: '',
  workflowRunUrl: 'https://github.com/org/repo/actions/runs/1',
};

describe('mapResultDetails', () => {
  it('returns success for passed', () => {
    const result = mapResultDetails({ ...baseParams, reason: 'passed' });
    assert.equal(result.conclusion, 'success');
    assert.match(result.title, /passed/);
    assert.match(result.summary, /PR #123/);
  });

  it('returns neutral for held', () => {
    const result = mapResultDetails({ ...baseParams, reason: 'passed', held: true });
    assert.equal(result.conclusion, 'neutral');
    assert.match(result.title, /hold-e2e/);
  });

  it('held takes priority over any reason', () => {
    const result = mapResultDetails({ ...baseParams, reason: 'test-failed', held: true });
    assert.equal(result.conclusion, 'neutral');
  });

  it('includes pool retest suffix', () => {
    const result = mapResultDetails({
      ...baseParams,
      reason: 'passed',
      isPoolRetest: true,
    });
    assert.match(result.title, /retest after main advanced/);
  });

  it('returns failure with test details for test-failed', () => {
    const result = mapResultDetails({
      ...baseParams,
      reason: 'test-failed',
      testFailureSummary: '**2** tests failed',
    });
    assert.equal(result.conclusion, 'failure');
    assert.match(result.summary, /Failed Tests/);
    assert.match(result.summary, /2\*\* tests failed/);
    assert.match(result.summary, /retest-e2e/);
  });

  it('returns failure without test details when summary is empty', () => {
    const result = mapResultDetails({
      ...baseParams,
      reason: 'test-failed',
    });
    assert.equal(result.conclusion, 'failure');
    assert.ok(!result.summary.includes('Failed Tests'));
  });

  it('handles merge-conflict', () => {
    const result = mapResultDetails({ ...baseParams, reason: 'merge-conflict' });
    assert.equal(result.conclusion, 'failure');
    assert.match(result.title, /merge/i);
  });

  it('handles left-pool', () => {
    const result = mapResultDetails({ ...baseParams, reason: 'left-pool' });
    assert.equal(result.conclusion, 'failure');
    assert.match(result.summary, /lgtm\+approved/);
  });

  it('handles untrusted-retest', () => {
    const result = mapResultDetails({ ...baseParams, reason: 'untrusted-retest' });
    assert.equal(result.conclusion, 'failure');
    assert.match(result.summary, /OWNERS/);
  });

  it('handles resolve-context-failed', () => {
    const result = mapResultDetails({ ...baseParams, reason: 'resolve-context-failed' });
    assert.equal(result.conclusion, 'failure');
    assert.match(result.summary, /context/);
  });
});
