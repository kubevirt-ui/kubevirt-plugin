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
      // Skip empty/null suite payloads (e.g. `compute:` with no body in the results YAML)
      if (key === 'summary' || !value) return acc;

      acc.push([key, value as TestSuiteData]);
      return acc;
    }, []);
  }, [tests]);
};
