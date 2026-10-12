import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { getSensitivePaths, isSensitiveI18nPath } from './paths';

describe('isSensitiveI18nPath', () => {
  it('matches locales/', () => {
    assert.equal(isSensitiveI18nPath('locales/en/plugin__kubevirt-plugin.json'), true);
    assert.equal(isSensitiveI18nPath('locales/ja/plugin__kubevirt-plugin.json'), true);
  });

  it('ignores source, i18n scripts, and docs', () => {
    assert.equal(isSensitiveI18nPath('src/utils/i18n.ts'), false);
    assert.equal(isSensitiveI18nPath('i18n-scripts/memsource-upload.sh'), false);
    assert.equal(isSensitiveI18nPath('INTERNATIONALIZATION.md'), false);
    assert.equal(isSensitiveI18nPath('package.json'), false);
  });
});

describe('getSensitivePaths', () => {
  it('filters only locales/ paths from a changed file list', () => {
    assert.deepEqual(
      getSensitivePaths([
        'src/App.tsx',
        'locales/en/plugin__kubevirt-plugin.json',
        'i18n-scripts/README.md',
      ]),
      ['locales/en/plugin__kubevirt-plugin.json'],
    );
  });
});
