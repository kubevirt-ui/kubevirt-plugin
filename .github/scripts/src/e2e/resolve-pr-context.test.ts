import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { isPrTrusted, isTrustedE2eBot, TRUSTED_E2E_BOT_LOGINS } from './resolve-pr-context';

const forkPrWithoutOkToTest = {
  hasOkToTest: false,
  ownedByAuthor: false,
  sameRepo: false,
};

describe('isTrustedE2eBot', () => {
  it('trusts darwin-project-ai[bot]', () => {
    assert.equal(isTrustedE2eBot('darwin-project-ai[bot]'), true);
  });

  it('does not trust other bots or humans', () => {
    assert.equal(isTrustedE2eBot('untrusted-bot[bot]'), false);
    assert.equal(isTrustedE2eBot('dependabot[bot]'), false);
    assert.equal(isTrustedE2eBot('some-contributor'), false);
    assert.equal(isTrustedE2eBot(''), false);
  });

  it('requires an exact login match (no case folding, no [bot] stripping)', () => {
    assert.equal(isTrustedE2eBot('Darwin-Project-AI[bot]'), false);
    assert.equal(isTrustedE2eBot('darwin-project-ai'), false);
  });

  it('only allowlists darwin-project-ai[bot]', () => {
    assert.deepEqual([...TRUSTED_E2E_BOT_LOGINS], ['darwin-project-ai[bot]']);
  });
});

describe('isPrTrusted', () => {
  it('trusts a darwin-project-ai[bot] fork PR without ok-to-test', () => {
    assert.equal(isPrTrusted({ ...forkPrWithoutOkToTest, author: 'darwin-project-ai[bot]' }), true);
  });

  it('does not trust an unknown bot fork PR without ok-to-test', () => {
    assert.equal(isPrTrusted({ ...forkPrWithoutOkToTest, author: 'untrusted-bot[bot]' }), false);
  });

  it('does not trust an unknown human fork PR without ok-to-test', () => {
    assert.equal(isPrTrusted({ ...forkPrWithoutOkToTest, author: 'stranger' }), false);
  });

  it('keeps the existing trust paths working', () => {
    assert.equal(isPrTrusted({ ...forkPrWithoutOkToTest, author: 'x', ownedByAuthor: true }), true);
    assert.equal(isPrTrusted({ ...forkPrWithoutOkToTest, author: 'x', sameRepo: true }), true);
    assert.equal(isPrTrusted({ ...forkPrWithoutOkToTest, author: 'x', hasOkToTest: true }), true);
  });
});
