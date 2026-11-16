import type { FailedTestGroup } from './normalizeFailedTests';
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
 * Parses each failed test name and assigns a stable React key. The key includes a per-group
 * occurrence index so duplicate test names within the same category stay unique.
 */
export const parseFailedTestGroups = (groups: FailedTestGroup[]): ParsedFailedTestGroup[] =>
  groups.map(({ category, tests }) => ({ category, tests: parseGroupTests(category, tests) }));
