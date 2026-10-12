import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { isRequiredGatingSuite } from './is-required-gating-suite';

describe('isRequiredGatingSuite', () => {
  it('is true only for unfiltered gating', () => {
    assert.equal(isRequiredGatingSuite('gating', ''), true);
    assert.equal(isRequiredGatingSuite('gating', '-g Foo'), false);
    assert.equal(isRequiredGatingSuite('tier1', ''), false);
  });
});
