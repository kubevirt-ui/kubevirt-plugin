import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { parseTestArgs } from './parse-test-args';

describe('parseTestArgs', () => {
  it('returns an empty list for blank input', () => {
    assert.deepEqual(parseTestArgs(''), []);
    assert.deepEqual(parseTestArgs('   '), []);
  });

  it('splits unquoted tokens on whitespace', () => {
    assert.deepEqual(parseTestArgs('-g MyTest --workers=2'), ['-g', 'MyTest', '--workers=2']);
  });

  it('keeps double-quoted values with spaces as one token', () => {
    assert.deepEqual(parseTestArgs('-g "search language"'), ['-g', 'search language']);
  });

  it('keeps single-quoted values with spaces as one token', () => {
    assert.deepEqual(parseTestArgs("-g 'VM Search Language'"), ['-g', 'VM Search Language']);
  });

  it('preserves spec paths and strips invisible bidi marks', () => {
    assert.deepEqual(parseTestArgs('playwright/tests/tier1/foo.spec.ts\u200e'), [
      'playwright/tests/tier1/foo.spec.ts',
    ]);
  });
});
