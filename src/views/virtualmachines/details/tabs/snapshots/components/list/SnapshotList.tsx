import * as React from 'react';

import {
  ListPageFilter,
  useListPageFilter,
  VirtualizedTable,
} from '@openshift-console/dynamic-plugin-sdk';

import useSnapshotColumns from '../../hooks/useSnapshotColumns';
import { UseSnapshotData } from '../../hooks/useSnapshotData';
import { filters } from '../../utils/filters';

import SnapshotRow from './SnapshotRow';

type SnapshotsListProps = UseSnapshotData & { isVMRunning?: boolean };

const SnapshotsList: React.FC<SnapshotsListProps> = ({
  snapshots,
  restoresMap,
  loaded,
  error,
  isVMRunning,
}) => {
  const columns = useSnapshotColumns();
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
        rowData={{ restores: restoresMap, isVMRunning }}
      />
    </>
  );
};

export default SnapshotsList;
