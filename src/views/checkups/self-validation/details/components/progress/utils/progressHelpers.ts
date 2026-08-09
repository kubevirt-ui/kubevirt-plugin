import { TEST_STATUS_COMPLETED, TEST_STATUS_FAILED, TEST_SUITE_OPTIONS } from '../../../../utils';
import type { TestSuiteProgress } from './types';

export const getTotalSkippedTests = (suites: TestSuiteProgress[]): number => {
  if (!suites) {
    return 0;
  }

  let totalSkipped = 0;
  for (const suite of suites) {
    if (
      (suite.status === TEST_STATUS_COMPLETED || suite.status === TEST_STATUS_FAILED) &&
      suite.testsRun !== undefined &&
      suite.testsPassed !== undefined &&
      suite.testsFailed !== undefined
    ) {
      const skipped = suite.testsRun - (suite.testsPassed + suite.testsFailed);
      totalSkipped += Math.max(0, skipped);
    }
  }

  return totalSkipped;
};

export const getTestSuiteLabel = (suiteName: string): string => {
  return TEST_SUITE_OPTIONS.find((option) => option.value === suiteName)?.label ?? suiteName;
};
