export type FailedTestGroup = {
  category: string;
  tests: string[];
};

export type NormalizedFailedTests = {
  groups: FailedTestGroup[];
  isMalformed: boolean;
  total: number;
};

type FailedTestsEntry = [category: string, tests: string[]];

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'string');

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  if (typeof value !== 'object' || value === null) return false;
  const prototype: unknown = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
};

const isFailedTestsEntry = (entry: [string, unknown]): entry is FailedTestsEntry =>
  isStringArray(entry[1]);

const toMalformedResult = (): NormalizedFailedTests => ({
  groups: [],
  isMalformed: true,
  total: 0,
});

const toGroupsResult = (entries: FailedTestsEntry[]): NormalizedFailedTests => {
  const groups = entries
    .filter(([, tests]) => tests.length > 0)
    .map(([category, tests]) => ({ category, tests }));

  return {
    groups,
    isMalformed: false,
    total: groups.reduce((sum, { tests }) => sum + tests.length, 0),
  };
};

/**
 * Normalizes a suite's `failed_tests` into a list of category groups.
 * Supports a flat `string[]` (single group with an empty category), a
 * `Record<string, string[]>` grouped by category (the tier2 runner format) and
 * empty/missing values. Any other shape is reported as malformed instead of throwing.
 */
export const normalizeFailedTests = (failedTests: unknown): NormalizedFailedTests => {
  if (failedTests === undefined || failedTests === null) return toGroupsResult([]);

  if (isStringArray(failedTests)) return toGroupsResult([['', failedTests]]);

  if (!isPlainObject(failedTests)) return toMalformedResult();

  const entries = Object.entries(failedTests);

  if (!entries.every(isFailedTestsEntry)) return toMalformedResult();

  return toGroupsResult(entries);
};
