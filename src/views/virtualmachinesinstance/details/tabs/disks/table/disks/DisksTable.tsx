import * as React from 'react';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import {
  ListPageBody,
  ListPageFilter,
  useListPageFilter,
  VirtualizedTable,
} from '@openshift-console/dynamic-plugin-sdk';

import useDisksTableColumns from '../../hooks/useDisksTableColumns';
import useDisksTableDisks from '../../hooks/useDisksTableDisks';
import { filters } from '../../utils/virtualMachinesInstancePageDisksTabUtils';

import DisksTableRow from './DisksTableRow';
import DiskTableTitle from './DisksTableTitle';

type DisksTableProps = {
  vmi: V1VirtualMachineInstance;
};

const DisksTable: React.FC<DisksTableProps> = ({ vmi }) => {
  const columns = useDisksTableColumns();
  const [disks, loaded, loadingError] = useDisksTableDisks(vmi);
  const [data, filteredData, onFilterChange] = useListPageFilter(disks, filters);
  return (
    <>
      <DiskTableTitle />
      <ListPageBody>
        <ListPageFilter
          data={data}
          loaded={loaded}
          rowFilters={filters}
          onFilterChange={onFilterChange}
          hideLabelFilter
        />
        <VirtualizedTable
          data={filteredData}
          unfilteredData={disks}
          loaded={loaded}
          loadError={loadingError}
          columns={columns}
          Row={DisksTableRow}
        />
      </ListPageBody>
    </>
  );
};

export default DisksTable;
