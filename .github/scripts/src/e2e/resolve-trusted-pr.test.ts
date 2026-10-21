import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';

import { isListedInLocalOwners, resolveTrustLogin } from '../shared/owners';

const OWNERS_WITH_ALICE = `approvers:
  - alice
reviewers:
  - alice
`;

describe('resolveTrustLogin', () => {
  it('uses triggeredBy when the actor is a bot', () => {
    assert.equal(resolveTrustLogin('kubevirt-plugin-bot[bot]', 'galkremer1'), 'galkremer1');
  });

  it('uses the human actor when triggeredBy is empty', () => {
    assert.equal(resolveTrustLogin('galkremer1', ''), 'galkremer1');
  });

  it('ignores triggeredBy for a human actor (prevents spoofing)', () => {
    assert.equal(resolveTrustLogin('attacker', 'upalatucci'), 'attacker');
  });

  it('falls back to the bot actor when triggeredBy is missing', () => {
    assert.equal(resolveTrustLogin('kubevirt-plugin-bot[bot]', ''), 'kubevirt-plugin-bot[bot]');
  });

  it('on rerun, uses GITHUB_TRIGGERING_ACTOR and ignores original TRIGGERED_BY', () => {
    // Owner-authorized bot dispatch, then a non-owner clicks Re-run.
    const trustLogin = resolveTrustLogin('kubevirt-plugin-bot[bot]', 'alice', {
      runAttempt: 2,
      triggeringActor: 'eve-nonowner',
    });
    assert.equal(trustLogin, 'eve-nonowner');

    const dir = mkdtempSync(join(tmpdir(), 'owners-rerun-'));
    const ownersPath = join(dir, 'OWNERS');
    writeFileSync(ownersPath, OWNERS_WITH_ALICE);

    // Current triggerer is not in OWNERS — must not inherit alice's authorization,
    // and PR head trust is never used (only the triggerer login is checked).
    assert.equal(isListedInLocalOwners(trustLogin, ownersPath), false);
    assert.equal(isListedInLocalOwners('alice', ownersPath), true);
  });

  it('on rerun of a human UI dispatch, uses triggering actor not original actor', () => {
    assert.equal(
      resolveTrustLogin('alice', '', {
        runAttempt: 2,
        triggeringActor: 'eve-nonowner',
      }),
      'eve-nonowner',
    );
  });

  it('on rerun with missing triggering actor, fails closed (empty login)', () => {
    assert.equal(
      resolveTrustLogin('kubevirt-plugin-bot[bot]', 'alice', { runAttempt: 2 }),
      '',
    );
  });
});
