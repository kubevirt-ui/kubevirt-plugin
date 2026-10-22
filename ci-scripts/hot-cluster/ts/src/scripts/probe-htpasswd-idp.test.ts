import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  classifyHtpasswdIdpSecrets,
  HTPASSWD_IDP_PROBE_PATCH,
  HTPASSWD_SECRET_NAME,
  interpretHtpasswdProbe,
  isOauthImmutableDenial,
  parseIdentityProviders,
  probeHtpasswdIdpAvailability,
} from './probe-htpasswd-idp';

describe('isOauthImmutableDenial', () => {
  it('matches ValidatingAdmissionPolicy denials', () => {
    assert.equal(
      isOauthImmutableDenial(
        `The oauths "cluster" is invalid: : ValidatingAdmissionPolicy 'config' with binding 'config-binding' denied request: This resource cannot be created, updated, or deleted. Please ask your administrator to modify the resource in the HostedCluster object.`,
      ),
      true,
    );
  });

  it('rejects unrelated errors', () => {
    assert.equal(isOauthImmutableDenial('Unauthorized'), false);
  });
});

describe('classifyHtpasswdIdpSecrets', () => {
  it('returns none when no HTPasswd providers exist', () => {
    assert.equal(classifyHtpasswdIdpSecrets([{ type: 'OIDC' }]), 'none');
  });

  it('returns match when any HTPasswd provider references htpass-secret', () => {
    assert.equal(
      classifyHtpasswdIdpSecrets([
        { type: 'HTPasswd', htpasswd: { fileData: { name: 'other' } } },
        { type: 'HTPasswd', htpasswd: { fileData: { name: HTPASSWD_SECRET_NAME } } },
      ]),
      'match',
    );
  });

  it('returns mismatch when HTPasswd providers exist but none use htpass-secret', () => {
    assert.equal(
      classifyHtpasswdIdpSecrets([
        { type: 'HTPasswd', htpasswd: { fileData: { name: 'a' } } },
        { type: 'HTPasswd', htpasswd: { fileData: { name: 'b' } } },
      ]),
      'mismatch',
    );
  });
});

describe('parseIdentityProviders', () => {
  it('parses a JSON array', () => {
    assert.deepEqual(parseIdentityProviders('[{"type":"HTPasswd"}]'), [{ type: 'HTPasswd' }]);
  });

  it('returns [] for empty or invalid input', () => {
    assert.deepEqual(parseIdentityProviders(''), []);
    assert.deepEqual(parseIdentityProviders('not-json'), []);
  });
});

describe('interpretHtpasswdProbe', () => {
  it('treats an HTPasswd IDP backed by htpass-secret as available', () => {
    assert.deepEqual(
      interpretHtpasswdProbe({
        identityProviders: [
          { type: 'HTPasswd', htpasswd: { fileData: { name: HTPASSWD_SECRET_NAME } } },
        ],
        patchSucceeded: false,
      }),
      { available: true, reason: 'idp-present' },
    );
  });

  it('rejects HTPasswd IDPs that only point at other secrets', () => {
    assert.deepEqual(
      interpretHtpasswdProbe({
        identityProviders: [
          { type: 'HTPasswd', htpasswd: { fileData: { name: 'other-htpasswd' } } },
        ],
        patchSucceeded: true,
      }),
      { available: false, reason: 'htpasswd-secret-mismatch' },
    );
  });

  it('treats a successful OAuth dry-run as mutable when no HTPasswd IDP exists', () => {
    assert.deepEqual(interpretHtpasswdProbe({ identityProviders: [], patchSucceeded: true }), {
      available: true,
      reason: 'oauth-mutable',
    });
  });

  it('treats HostedCluster VAP denials as immutable', () => {
    assert.deepEqual(
      interpretHtpasswdProbe({
        identityProviders: [],
        patchErrorMessage:
          "ValidatingAdmissionPolicy 'config' denied request: modify the resource in the HostedCluster object.",
        patchSucceeded: false,
      }),
      { available: false, reason: 'oauth-immutable' },
    );
  });

  it('throws on unexpected patch failures', () => {
    assert.throws(
      () =>
        interpretHtpasswdProbe({
          identityProviders: [],
          patchErrorMessage: 'connection refused',
          patchSucceeded: false,
        }),
      /Unexpected OAuth probe failure/,
    );
  });
});

describe('probeHtpasswdIdpAvailability', () => {
  it('short-circuits when any HTPasswd IDP already uses htpass-secret', () => {
    const calls: string[] = [];
    const result = probeHtpasswdIdpAvailability((command) => {
      calls.push(command);
      return JSON.stringify([
        { type: 'HTPasswd', htpasswd: { fileData: { name: 'other' } } },
        { type: 'HTPasswd', htpasswd: { fileData: { name: HTPASSWD_SECRET_NAME } } },
      ]);
    });
    assert.deepEqual(result, { available: true, reason: 'idp-present' });
    assert.equal(calls.length, 1);
    assert.match(calls[0]!, /identityProviders/);
  });

  it('falls back to disabled when HTPasswd IDPs use other secrets only', () => {
    const result = probeHtpasswdIdpAvailability(() =>
      JSON.stringify([
        { type: 'HTPasswd', htpasswd: { fileData: { name: 'custom-a' } } },
        { type: 'HTPasswd', htpasswd: { fileData: { name: 'custom-b' } } },
      ]),
    );
    assert.deepEqual(result, { available: false, reason: 'htpasswd-secret-mismatch' });
  });

  it('does not treat a space-joined secret list as a single name match', () => {
    // Regression: jsonpath over multiple items can yield "htpass-secret other".
    // We parse providers as JSON objects instead of comparing that string.
    assert.equal(
      classifyHtpasswdIdpSecrets([
        { type: 'HTPasswd', htpasswd: { fileData: { name: `${HTPASSWD_SECRET_NAME} other` } } },
      ]),
      'mismatch',
    );
    assert.equal(
      classifyHtpasswdIdpSecrets([
        { type: 'HTPasswd', htpasswd: { fileData: { name: HTPASSWD_SECRET_NAME } } },
        { type: 'HTPasswd', htpasswd: { fileData: { name: 'other' } } },
      ]),
      'match',
    );
  });

  it('probes mutability with a dry-run patch that touches spec', () => {
    const calls: string[] = [];
    const result = probeHtpasswdIdpAvailability((command) => {
      calls.push(command);
      if (command.includes('jsonpath')) {
        return '[]';
      }
      return 'oauth.config.openshift.io/cluster patched (server dry run)';
    });
    assert.deepEqual(result, { available: true, reason: 'oauth-mutable' });
    assert.equal(calls.length, 2);
    assert.match(calls[1]!, /--dry-run=server/);
    assert.ok(calls[1]!.includes(HTPASSWD_IDP_PROBE_PATCH));
  });

  it('maps VAP denials from the dry-run to oauth-immutable', () => {
    const result = probeHtpasswdIdpAvailability((command) => {
      if (command.includes('jsonpath')) {
        return '[]';
      }
      throw new Error(
        "ValidatingAdmissionPolicy 'config' denied request: HostedCluster object",
      );
    });
    assert.deepEqual(result, { available: false, reason: 'oauth-immutable' });
  });
});
