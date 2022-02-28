import * as React from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import {
  ListPageFilter,
  useListPageFilter,
  VirtualizedTable,
} from '@openshift-console/dynamic-plugin-sdk';

import useDiskColumns from './hooks/useDiskColumns';
import useDisksTableData from './hooks/useDisksTableData';
import { filters } from './utils/VirtualMachineDisksTabUtils';
import DiskRow from './DiskRow';

type DiskListProps = {
  vm?: V1VirtualMachine;
};

const DiskList: React.FC<DiskListProps> = ({ vm }) => {
  const columns = useDiskColumns();
  const [disks, loaded, loadError] = useDisksTableData(vm);
  const [data, filteredData, onFilterChange] = useListPageFilter(disks, filters);
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
        loadError={loadError}
        columns={columns}
        Row={DiskRow}
      />
    </>
  );
};

export default DiskList;
