import { useMemo } from 'react';

import type { TestSuiteData } from '../TestSuiteCard';

import type { JobResults } from '../../../../utils';

/**
 * Hook to filter and format test suites from job results
 */
export const useFilteredTestSuites = (
  results: JobResults | null,
): Array<[string, TestSuiteData]> => {
  const tests = results?.tests;
  return useMemo((): Array<[string, TestSuiteData]> => {
    if (!tests) return [];
    return Object.entries(tests).reduce<Array<[string, TestSuiteData]>>((acc, [key, value]) => {
      if (key !== 'summary') {
        acc.push([key, value as TestSuiteData]);
      }
      return acc;
    }, []);
  }, [tests]);
};
