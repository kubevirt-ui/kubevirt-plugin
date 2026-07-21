import { isK8sForbiddenError, isK8sNotFoundError } from './errorStatusChecks';

describe('errorStatusChecks', () => {
  describe('isK8sNotFoundError', () => {
    it.each([[{ code: 404 }], [{ response: { status: 404 } }], [{ json: { code: 404 } }]])(
      'returns true for %j',
      (error) => {
        expect(isK8sNotFoundError(error)).toBe(true);
      },
    );

    it.each([null, undefined, 'not found', { code: 403 }, { response: { status: 500 } }])(
      'returns false for %j',
      (error) => {
        expect(isK8sNotFoundError(error)).toBe(false);
      },
    );
  });

  describe('isK8sForbiddenError', () => {
    it.each([[{ code: 403 }], [{ response: { status: 403 } }], [{ json: { code: 403 } }]])(
      'returns true for %j',
      (error) => {
        expect(isK8sForbiddenError(error)).toBe(true);
      },
    );

    it.each([null, undefined, { code: 404 }, { response: { status: 500 } }])(
      'returns false for %j',
      (error) => {
        expect(isK8sForbiddenError(error)).toBe(false);
      },
    );
  });
});
