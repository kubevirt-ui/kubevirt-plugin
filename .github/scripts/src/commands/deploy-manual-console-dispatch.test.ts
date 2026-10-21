import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  DEFAULT_DEPLOY_INFRA_TYPE,
  resolveDeployInfraType,
} from './deploy-manual-console-dispatch';

describe('resolveDeployInfraType', () => {
  it('uses an explicit INFRA_TYPE when set', () => {
    assert.equal(resolveDeployInfraType('classic'), 'classic');
    assert.equal(resolveDeployInfraType('ipi', 'failure'), 'ipi');
  });

  it('defaults to vpc when INFRA_TYPE is unset (slash-command path)', () => {
    assert.equal(resolveDeployInfraType(undefined), DEFAULT_DEPLOY_INFRA_TYPE);
    assert.equal(resolveDeployInfraType(''), DEFAULT_DEPLOY_INFRA_TYPE);
    assert.equal(DEFAULT_DEPLOY_INFRA_TYPE, 'vpc');
  });

  it('still defaults to vpc after a failed detection (not ipi)', () => {
    assert.equal(resolveDeployInfraType(undefined, 'failure'), 'vpc');
  });
});
