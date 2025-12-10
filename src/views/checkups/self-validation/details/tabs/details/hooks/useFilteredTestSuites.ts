import { useMemo } from 'react';

import { JobResults } from '../../../../utils';
import { TestSuiteData } from '../TestSuiteCard';

/**
 * Hook to filter and format test suites from job results
 */
export const useFilteredTestSuites = (
  results: JobResults | null,
): Array<[string, TestSuiteData]> => {
  return useMemo((): Array<[string, TestSuiteData]> => {
    if (!results?.tests) return [];
    return Object.entries(results.tests)
      .filter(([key]) => key !== 'summary')
      .map(([key, value]) => [key, value as TestSuiteData]);
  }, [results?.tests]);
};
