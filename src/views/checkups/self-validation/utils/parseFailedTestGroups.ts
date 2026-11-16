import { isEmpty } from '@kubevirt-utils/utils/utils';

import type { FailedTestsByCategory } from './constants';
import { parseFailedTest } from './selfValidationResults';

export type ParsedFailedTest = ReturnType<typeof parseFailedTest> & { key: string };

export type ParsedFailedTestGroup = {
  category: string;
  tests: ParsedFailedTest[];
};

const parseGroupTests = (category: string, tests: string[]): ParsedFailedTest[] => {
  const seen = new Map<string, number>();

  return tests.map((testName) => {
    const occurrence = seen.get(testName) ?? 0;
    seen.set(testName, occurrence + 1);

    return {
      key: `failed-${category}-${testName}-${occurrence}`,
      ...parseFailedTest(testName),
    };
  });
};

/**
 * Turns a suite's `failed_tests` (grouped by category, the runner format) into non-empty category
 * groups, parsing each test name and assigning a stable React key. The key includes a per-group
 * occurrence index so duplicate test names within the same category stay unique.
 *
 * A non-empty `failed_tests` is taken to be a `Record<string, string[]>`. This never throws: if
 * the runtime data turns out to be anything else, no groups are returned.
 */
export const parseFailedTestGroups = (
  failedTests?: FailedTestsByCategory | null,
): ParsedFailedTestGroup[] => {
  if (isEmpty(failedTests)) return [];

  try {
    return Object.entries(failedTests)
      .filter(([, tests]) => tests.length > 0)
      .map(([category, tests]) => ({ category, tests: parseGroupTests(category, tests) }));
  } catch {
    return [];
  }
};
