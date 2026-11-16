export type FailedTestGroup = {
  category: string;
  tests: string[];
};

export type NormalizedFailedTests = {
  groups: FailedTestGroup[];
  isMalformed: boolean;
  total: number;
};

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'string');

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  if (typeof value !== 'object' || value === null) return false;
  const prototype: unknown = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
};

/**
 * Normalizes a suite's `failed_tests` into a list of category groups.
 * Supports a flat `string[]` (single group with an empty category), a
 * `Record<string, string[]>` grouped by category (the tier2 runner format) and
 * empty/missing values. Any other shape is reported as malformed instead of throwing.
 */
export const normalizeFailedTests = (failedTests: unknown): NormalizedFailedTests => {
  const malformed: NormalizedFailedTests = { groups: [], isMalformed: true, total: 0 };

  if (failedTests === undefined || failedTests === null) {
    return { groups: [], isMalformed: false, total: 0 };
  }

  if (Array.isArray(failedTests)) {
    if (!isStringArray(failedTests)) return malformed;
    return {
      groups: failedTests.length > 0 ? [{ category: '', tests: failedTests }] : [],
      isMalformed: false,
      total: failedTests.length,
    };
  }

  if (!isPlainObject(failedTests)) return malformed;

  const entries = Object.entries(failedTests);
  if (!entries.every(([, tests]) => isStringArray(tests))) return malformed;

  const groups = entries
    .filter(([, tests]) => (tests as string[]).length > 0)
    .map(([category, tests]) => ({ category, tests: tests as string[] }));

  return {
    groups,
    isMalformed: false,
    total: groups.reduce((sum, { tests }) => sum + tests.length, 0),
  };
};
