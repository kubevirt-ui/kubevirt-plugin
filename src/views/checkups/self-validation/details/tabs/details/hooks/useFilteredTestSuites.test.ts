import { renderHook } from '@testing-library/react';

import type { JobResults } from '../../../../utils';
import { useFilteredTestSuites } from './useFilteredTestSuites';

jest.mock('../TestSuiteCard', () => ({}));

const toResults = (tests: unknown): JobResults =>
  ({ tests, timestamps: {} }) as unknown as JobResults;

describe('useFilteredTestSuites', () => {
  it('should return no suites without results', () => {
    const { result } = renderHook(() => useFilteredTestSuites(null));

    expect(result.current).toEqual([]);
  });

  it('should skip the summary and keep the suites', () => {
    const compute = { tests_run: 2 };
    const { result } = renderHook(() =>
      useFilteredTestSuites(toResults({ compute, summary: { total_tests_run: 2 } })),
    );

    expect(result.current).toEqual([['compute', compute]]);
  });

  it('should skip empty suite payloads instead of passing them to the suite card', () => {
    const storage = { tests_run: 1 };
    const { result } = renderHook(() =>
      useFilteredTestSuites(toResults({ compute: null, network: undefined, storage })),
    );

    expect(result.current).toEqual([['storage', storage]]);
  });
});
