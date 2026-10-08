import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';

import { resolveTestRunEnvironmentFromEnv } from './resolve-test-run-environment';

const ORIGINAL_ENV = { ...process.env };

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe('resolveTestRunEnvironmentFromEnv', () => {
  it('maps workflow env vars and omits runner when it matches cluster', () => {
    process.env = {
      ...ORIGINAL_ENV,
      CLUSTER_NAME: 'kubevirt-plugin-ci',
      RUNNER_LABEL: 'kubevirt-plugin-ci',
      GITHUB_RUN_ID: '12345',
      GITHUB_SERVER_URL: 'https://github.com',
      GITHUB_REPOSITORY: 'org/repo',
      GITHUB_SHA: 'abcdef1234567890',
      OPENSHIFT_VERSION: '4.21_openshift',
      INFRASTRUCTURE_TYPE: 'vpc',
      CNV_CHANNEL: 'stable',
      PR_NUMBER: '99',
    };

    const environment = resolveTestRunEnvironmentFromEnv();

    assert.equal(environment.clusterName, 'kubevirt-plugin-ci');
    assert.equal(environment.runnerLabel, undefined);
    assert.equal(environment.workflowRunLabel, '#12345');
    assert.equal(environment.workflowRunUrl, 'https://github.com/org/repo/actions/runs/12345');
    assert.equal(environment.gitSha, 'abcdef1');
    assert.equal(environment.openshiftVersion, '4.21_openshift');
    assert.equal(environment.infrastructureType, 'vpc');
    assert.equal(environment.cnvChannel, 'stable');
    assert.equal(environment.prNumber, '99');
  });

  it('keeps runner label when it differs from cluster name', () => {
    process.env = {
      ...ORIGINAL_ENV,
      CLUSTER_NAME: 'kubevirt-plugin-ci',
      RUNNER_LABEL: 'custom-runner',
    };

    assert.equal(resolveTestRunEnvironmentFromEnv().runnerLabel, 'custom-runner');
  });
});
