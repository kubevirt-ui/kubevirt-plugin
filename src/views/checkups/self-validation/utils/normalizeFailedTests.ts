export type FailedTestGroup = {
  category: string;
  tests: string[];
};

type FailedTestsEntry = [category: string, tests: string[]];

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'string');

const isPlainRecord = (value: unknown): value is Record<string, unknown> => {
  if (typeof value !== 'object' || value === null) return false;
  const prototype: unknown = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
};

const isFailedTestsEntry = (entry: [string, unknown]): entry is FailedTestsEntry =>
  isStringArray(entry[1]);

/**
 * Normalizes a suite's `failed_tests` (a `Record<string, string[]>` grouped by category, the
 * runner format) into a list of non-empty category groups. Malformed data never throws: anything
 * that is not a plain record yields no groups, and entries that are not a list of strings are
 * skipped.
 */
export const normalizeFailedTests = (failedTests: unknown): FailedTestGroup[] => {
  if (!isPlainRecord(failedTests)) return [];

  return Object.entries(failedTests)
    .filter(isFailedTestsEntry)
    .filter(([, tests]) => tests.length > 0)
    .map(([category, tests]) => ({ category, tests }));
};
