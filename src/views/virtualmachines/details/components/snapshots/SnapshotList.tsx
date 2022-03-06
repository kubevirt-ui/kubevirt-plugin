import * as React from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import {
  ListPageFilter,
  useListPageFilter,
  VirtualizedTable,
} from '@openshift-console/dynamic-plugin-sdk';

import useSnapshotColumns from './hooks/useSnapshotColumns';
import useSnapshotData from './hooks/useSnapshotData';
import { filters } from './utils/filters';
import SnapshotRow from './SnapshotRow';

type SnapshotsListProps = {
  vm?: V1VirtualMachine;
};

const SnapshotsList: React.FC<SnapshotsListProps> = ({ vm }) => {
  const columns = useSnapshotColumns();
  const { snapshots, restoresMap, loaded, error } = useSnapshotData(vm?.metadata?.namespace);
  const [data, filteredData, onFilterChange] = useListPageFilter(snapshots, filters);
  return (
    <>
      <ListPageFilter
        data={data}
        loaded={loaded}
        rowFilters={filters}
        onFilterChange={onFilterChange}
      />
      <VirtualizedTable
        data={filteredData}
        unfilteredData={data}
        loaded={loaded}
        loadError={error}
        columns={columns}
        Row={SnapshotRow}
        rowData={{ restores: restoresMap }}
      />
    </>
  );
};

export default SnapshotsList;
