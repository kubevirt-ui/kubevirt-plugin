import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { isNotFoundError } from './retry';

describe('isNotFoundError', () => {
  it('matches statusCode 404', () => {
    const err = new Error('not found') as Error & { statusCode: number };
    err.statusCode = 404;
    assert.equal(isNotFoundError(err), true);
  });

  it('matches reason NotFound on the error or JSON body', () => {
    assert.equal(isNotFoundError({ reason: 'NotFound' }), true);
    assert.equal(
      isNotFoundError({
        body: JSON.stringify({
          code: 404,
          message: 'pods "x" not found',
          reason: 'NotFound',
        }),
      }),
      true,
    );
  });

  it('matches the client-node HTTP-Code: 404 message shape from run 40015274379', () => {
    assert.equal(
      isNotFoundError(
        new Error(
          'HTTP-Code: 404\nBody: {"kind":"Status","apiVersion":"v1","status":"Failure","message":"pods \\"kubevirt-plugin-419-5d945c74-listener\\" not found","reason":"NotFound","code":404}\n',
        ),
      ),
      true,
    );
  });

  it('matches string code 404 without a not-found message', () => {
    const err = new Error('HTTP request failed') as Error & { code: string };
    err.code = '404';
    assert.equal(isNotFoundError(err), true);
  });

  it('falls through a non-NotFound JSON body to the message check', () => {
    const err = new Error('HTTP 404: pods "x" not found') as Error & { body: string };
    err.body = JSON.stringify({ code: 500, reason: 'InternalError' });
    assert.equal(isNotFoundError(err), true);
  });

  it('rejects unrelated errors', () => {
    assert.equal(isNotFoundError(new Error('connection refused')), false);
    const forbidden = new Error('forbidden') as Error & { statusCode: number };
    forbidden.statusCode = 403;
    assert.equal(isNotFoundError(forbidden), false);
  });
});
