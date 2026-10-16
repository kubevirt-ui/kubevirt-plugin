import * as React from 'react';

import { render } from '@testing-library/react';

import VirtualMachinesInstancesList from './VirtualMachinesInstancesList';

const mockWatchResource = jest.fn();
const mockTableProps: { data?: { metadata: { name: string } }[] }[] = [];

jest.mock('@openshift-console/dynamic-plugin-sdk', () => {
  const actual = jest.requireActual('@openshift-console/dynamic-plugin-sdk');
  return {
    ...actual,
    ListPageBody: ({ children }) => children,
    ListPageFilter: () => null,
    ListPageHeader: () => null,
    useK8sWatchResource: (resource) => mockWatchResource(resource),
    useListPageFilter: (data) => {
      const filtered = data?.filter(() => true);
      return [data, filtered, jest.fn()];
    },
    VirtualizedTable: (props) => {
      mockTableProps.push(props);
      return null;
    },
  };
});

jest.mock('@multicluster/hooks/useClusterParam', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('@multicluster/urls', () => ({
  getCatalogURL: () => '/catalog',
}));

jest.mock('./hooks/useVirtualMachinesInstancesColumns', () => ({
  __esModule: true,
  default: () => [{ id: 'name', sort: 'metadata.name', title: 'Name' }],
}));

jest.mock('./utils', () => ({
  filters: [],
}));

jest.mock('./VirtualMachinesInstancesRow', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock(
  './components/VirtualMachineInstanceEmptyState/VirtualMachineInstanceEmptyState',
  () => ({
    __esModule: true,
    default: () => null,
  }),
);

const vmis = [
  { metadata: { name: 'b-vm', namespace: 'ns-b', uid: '2' } },
  { metadata: { name: 'a-vm', namespace: 'ns-a', uid: '1' } },
];

// Same branch VirtualizedTable takes on 4.21 when the Name column sort is a string.
const sortLikeConsole = (data, columns) => {
  const sortColumn = columns[0];
  if (!sortColumn?.sort) {
    return data;
  }
  if (typeof sortColumn.sort === 'string') {
    return data.sort((a, b) => a.metadata.name.localeCompare(b.metadata.name));
  }
  return sortColumn.sort(data, 'asc');
};

describe('VirtualMachinesInstancesList', () => {
  beforeEach(() => {
    mockTableProps.length = 0;
    mockWatchResource.mockReset();
  });

  it('shows watched instances instead of handing undefined to the table sort', () => {
    mockWatchResource.mockImplementation((resource) => (resource ? [vmis, true, undefined] : [undefined, false, undefined]));

    render(
      <VirtualMachinesInstancesList
        kind="kubevirt.io~v1~VirtualMachineInstance"
        namespace={undefined}
      />,
    );

    const watched = mockWatchResource.mock.calls.find(([resource]) => resource)?.[0];
    expect(watched.groupVersionKind).toEqual({
      group: 'kubevirt.io',
      kind: 'VirtualMachineInstance',
      version: 'v1',
    });

    const tableData = mockTableProps.at(-1).data;
    expect(sortLikeConsole(tableData, [{ sort: 'metadata.name' }]).map((vmi) => vmi.metadata.name)).toEqual([
      'a-vm',
      'b-vm',
    ]);
  });

  it('sorts an empty list without throwing', () => {
    mockWatchResource.mockImplementation((resource) => (resource ? [[], true, undefined] : [undefined, false, undefined]));

    render(<VirtualMachinesInstancesList kind="kubevirt.io~v1~VirtualMachineInstance" namespace="" />);

    const tableData = mockTableProps.at(-1).data;
    expect(tableData).toEqual([]);
    expect(sortLikeConsole(tableData, [{ sort: 'metadata.name' }])).toEqual([]);
  });
});
