import React from 'react';

import useCanPatchFeaturesConfigMap from '@kubevirt-utils/hooks/useCanPatchFeaturesConfigMap';
import useClusterInstanceTypes from '@kubevirt-utils/hooks/useClusterInstanceTypes';
import { render } from '@testing-library/react';

import ClusterInstancetypeList from './ClusterInstancetypeList';

const mockTableColumns = jest.fn();

jest.mock('@kubevirt-utils/hooks/useCanPatchFeaturesConfigMap', () => jest.fn());
jest.mock('@kubevirt-utils/hooks/useClusterInstanceTypes', () => jest.fn());
jest.mock('@kubevirt-utils/hooks/useKubevirtDataViewFilters/filters/useClusterFilter', () => ({
  __esModule: true,
  default: jest.fn(() => ({})),
}));
jest.mock('@kubevirt-utils/hooks/useKubevirtDataViewFilters/useKubevirtDataViewFilters', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    clearAllFilters: jest.fn(),
    filteredData: [],
    filters: {},
    onSetFilters: jest.fn(),
  })),
}));
jest.mock('@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtTableColumns', () => ({
  __esModule: true,
  default: jest.fn(({ columns }: { columns: { key: string }[] }) => ({
    activeColumnKeys: columns.map(({ key }) => key),
    loaded: true,
  })),
}));
jest.mock('@kubevirt-utils/hooks/usePagination/usePaginationWithFilters', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    handleFilterChange: jest.fn(),
    handlePerPageSelect: jest.fn(),
    handleSetPage: jest.fn(),
    pagination: { page: 1, perPage: 10 },
  })),
}));
jest.mock('@kubevirt-utils/hooks/useTableExport', () => ({
  EXPORT_TABLE_KEYS: { CLUSTER_INSTANCETYPES: 'x' },
  KubevirtTableExport: ({ columns }: { columns: { key: string }[] }) => {
    mockTableColumns('export', columns);
    return null;
  },
}));
jest.mock('@kubevirt-utils/components/KubevirtTable/KubevirtTable', () => ({
  __esModule: true,
  default: ({ columns }: { columns: { key: string }[] }) => {
    mockTableColumns('table', columns);
    return null;
  },
}));
jest.mock('@kubevirt-utils/components/KubevirtFilterToolbar/KubevirtFilterToolbar', () => ({
  __esModule: true,
  default: ({ toolbarEndContent }: { toolbarEndContent: React.ReactNode }) => (
    <div>{toolbarEndContent}</div>
  ),
}));
jest.mock('./components/FamilyAvailabilitySection/FamilyAvailabilitySection', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('./components/FamilyStatusCell/FamilyStatusCell', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('@multicluster/components/MulticlusterResourceLink/MulticlusterResourceLink', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('../actions/ClusterInstancetypeActions', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('@multicluster/hooks/useIsAllClustersPage', () => ({
  __esModule: true,
  default: jest.fn(() => false),
}));
jest.mock('@multicluster/useIsACMPage', () => ({
  __esModule: true,
  default: jest.fn(() => false),
}));
jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  ListPageBody: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const columnKeys = (target: string): string[] | undefined =>
  mockTableColumns.mock.calls
    .filter(([name]) => name === target)
    .at(-1)?.[1]
    .map(({ key }: { key: string }) => key);

describe('ClusterInstancetypeList family status column', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useClusterInstanceTypes).mockReturnValue([[], true, undefined]);
  });

  it.each([
    ['the user can patch the features ConfigMap', [true, false], true],
    ['the user cannot patch the features ConfigMap', [false, false], false],
    ['the access review is still loading', [true, true], false],
  ])('family status column visibility when %s', (_label, review, expected) => {
    jest.mocked(useCanPatchFeaturesConfigMap).mockReturnValue(review as [boolean, boolean]);

    render(<ClusterInstancetypeList />);

    expect(columnKeys('table')?.includes('familyStatus')).toBe(expected);
    expect(columnKeys('export')?.includes('familyStatus')).toBe(expected);
  });
});
