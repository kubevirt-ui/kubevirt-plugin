import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { renderHook } from '@testing-library/react';

import { KubevirtFilter, KubevirtFilterState } from './types';
import useKubevirtDataViewFilters from './useKubevirtDataViewFilters';

let mockFiltersState: KubevirtFilterState = { labels: [], name: [] };
const mockClearAllFilters = jest.fn();
const mockOnSetFilters = jest.fn();

jest.mock('@kubevirt-utils/components/ListPageFilter/utils', () => ({
  fuzzyCaseInsensitive: (needle: string, haystack: string) =>
    haystack.toLowerCase().includes(needle.toLowerCase()),
  getLabelsAsString: (obj: K8sResourceCommon) =>
    Object.entries(obj?.metadata?.labels ?? {}).map(([k, v]) => `${k}=${v}`),
}));

jest.mock('@kubevirt-utils/hooks/useKubevirtTranslation', () => ({
  useKubevirtTranslation: () => ({ t: (str: string) => str }),
}));

jest.mock('@patternfly/react-data-view', () => ({
  useDataViewFilters: jest.fn(() => ({
    clearAllFilters: mockClearAllFilters,
    filters: mockFiltersState,
    onSetFilters: mockOnSetFilters,
  })),
}));

const setSearchParamsMock = jest.fn();
const searchParamsMock = new URLSearchParams();

jest.mock('react-router', () => ({
  useSearchParams: () => [searchParamsMock, setSearchParamsMock],
}));

const createResource = (name: string, labels?: Record<string, string>): K8sResourceCommon => ({
  apiVersion: 'v1',
  kind: 'ConfigMap',
  metadata: {
    labels,
    name,
    namespace: 'default',
  },
});

describe('useKubevirtDataViewFilters', () => {
  beforeEach(() => {
    mockFiltersState = { labels: [], name: [] };
    jest.clearAllMocks();
  });

  const baseFilters: KubevirtFilter[] = [
    {
      categoryLabel: 'Status',
      id: 'status',
      match: (obj, selected) => selected.includes(obj.metadata?.labels?.['status'] ?? ''),
      options: [
        { label: 'Running', value: 'running' },
        { label: 'Stopped', value: 'stopped' },
      ],
    },
  ];

  const sampleData: K8sResourceCommon[] = [
    createResource('alpha-vm', { app: 'web', status: 'running' }),
    createResource('beta-vm', { app: 'db', status: 'stopped' }),
    createResource('gamma-vm', { app: 'web', status: 'running' }),
  ];

  describe('filteredData', () => {
    it('should return all data when no filters are active', () => {
      mockFiltersState = { labels: [], name: [], status: [] };

      const { result } = renderHook(() =>
        useKubevirtDataViewFilters({ data: sampleData, filters: baseFilters }),
      );

      expect(result.current.filteredData).toHaveLength(3);
    });

    it('should filter by name using fuzzy case-insensitive match', () => {
      mockFiltersState = { labels: [], name: ['alpha'], status: [] };

      const { result } = renderHook(() =>
        useKubevirtDataViewFilters({ data: sampleData, filters: baseFilters }),
      );

      expect(result.current.filteredData).toHaveLength(1);
      expect(result.current.filteredData[0].metadata.name).toBe('alpha-vm');
    });

    it('should be case-insensitive for name filter', () => {
      mockFiltersState = { labels: [], name: ['BETA'], status: [] };

      const { result } = renderHook(() =>
        useKubevirtDataViewFilters({ data: sampleData, filters: baseFilters }),
      );

      expect(result.current.filteredData).toHaveLength(1);
      expect(result.current.filteredData[0].metadata.name).toBe('beta-vm');
    });

    it('should filter by labels (must match all selected labels)', () => {
      mockFiltersState = { labels: ['app=web'], name: [], status: [] };

      const { result } = renderHook(() =>
        useKubevirtDataViewFilters({ data: sampleData, filters: baseFilters }),
      );

      expect(result.current.filteredData).toHaveLength(2);
      expect(result.current.filteredData.map((d) => d.metadata.name)).toEqual([
        'alpha-vm',
        'gamma-vm',
      ]);
    });

    it('should require all labels to match when multiple labels selected', () => {
      mockFiltersState = { labels: ['app=web', 'status=running'], name: [], status: [] };

      const { result } = renderHook(() =>
        useKubevirtDataViewFilters({ data: sampleData, filters: baseFilters }),
      );

      expect(result.current.filteredData).toHaveLength(2);
    });

    it('should apply custom filter match functions', () => {
      mockFiltersState = { labels: [], name: [], status: ['running'] };

      const { result } = renderHook(() =>
        useKubevirtDataViewFilters({ data: sampleData, filters: baseFilters }),
      );

      expect(result.current.filteredData).toHaveLength(2);
      expect(result.current.filteredData.map((d) => d.metadata.name)).toEqual([
        'alpha-vm',
        'gamma-vm',
      ]);
    });

    it('should combine name + labels + custom filters with AND logic', () => {
      mockFiltersState = { labels: ['app=web'], name: ['alpha'], status: ['running'] };

      const { result } = renderHook(() =>
        useKubevirtDataViewFilters({ data: sampleData, filters: baseFilters }),
      );

      expect(result.current.filteredData).toHaveLength(1);
      expect(result.current.filteredData[0].metadata.name).toBe('alpha-vm');
    });

    it('should return empty array when data is undefined', () => {
      mockFiltersState = { labels: [], name: [], status: [] };

      const { result } = renderHook(() =>
        useKubevirtDataViewFilters({
          data: undefined as unknown as K8sResourceCommon[],
          filters: baseFilters,
        }),
      );

      expect(result.current.filteredData).toEqual([]);
    });

    it('should return empty array when no items match', () => {
      mockFiltersState = { labels: [], name: ['nonexistent'], status: [] };

      const { result } = renderHook(() =>
        useKubevirtDataViewFilters({ data: sampleData, filters: baseFilters }),
      );

      expect(result.current.filteredData).toEqual([]);
    });

    it('should handle multiple custom filters with AND logic', () => {
      const multiFilters: KubevirtFilter[] = [
        ...baseFilters,
        {
          categoryLabel: 'App',
          id: 'app',
          match: (obj, selected) => selected.includes(obj.metadata?.labels?.['app'] ?? ''),
          options: [
            { label: 'Web', value: 'web' },
            { label: 'DB', value: 'db' },
          ],
        },
      ];

      mockFiltersState = { app: ['web'], labels: [], name: [], status: ['running'] };

      const { result } = renderHook(() =>
        useKubevirtDataViewFilters({ data: sampleData, filters: multiFilters }),
      );

      expect(result.current.filteredData).toHaveLength(2);
      expect(result.current.filteredData.map((d) => d.metadata.name)).toEqual([
        'alpha-vm',
        'gamma-vm',
      ]);
    });
  });

  describe('initialFilters', () => {
    it('should build initial filters from filter definitions with defaultSelected', () => {
      const { useDataViewFilters } = jest.requireMock('@patternfly/react-data-view');

      const filtersWithDefaults: KubevirtFilter[] = [
        {
          categoryLabel: 'Status',
          defaultSelected: ['running'],
          id: 'status',
          match: jest.fn(),
          options: [{ label: 'Running', value: 'running' }],
        },
        {
          categoryLabel: 'Arch',
          id: 'arch',
          match: jest.fn(),
          options: [{ label: 'x86_64', value: 'x86_64' }],
        },
      ];

      renderHook(() => useKubevirtDataViewFilters({ data: [], filters: filtersWithDefaults }));

      const callArgs = useDataViewFilters.mock.calls[0][0];
      expect(callArgs.initialFilters).toEqual({
        arch: [],
        labels: [],
        name: [],
        status: ['running'],
      });
    });
  });
});
