import * as React from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  ListPageBody,
  ListPageCreateButton,
  ListPageFilter,
  ListPageHeader,
  useListPageFilter,
  VirtualizedTable,
} from '@openshift-console/dynamic-plugin-sdk';

import useDiskColumns from '../../hooks/useDiskColumns';
import useDisksTableData from '../../hooks/useDisksTableData';
import { filters } from '../../utils/VirtualMachineDisksTabUtils';

import DiskRow from './DiskRow';
import DiskTableTitle from './DiskTableTitle';

type DiskListProps = {
  vm?: V1VirtualMachine;
};

const DiskList: React.FC<DiskListProps> = ({ vm }) => {
  const { t } = useKubevirtTranslation();
  const columns = useDiskColumns();
  const [disks, loaded, loadError] = useDisksTableData(vm);
  const [data, filteredData, onFilterChange] = useListPageFilter(disks, filters);
  return (
    <>
      <ListPageHeader title="">
        <ListPageCreateButton>{t('Add disk')}</ListPageCreateButton>
      </ListPageHeader>
      <ListPageBody>
        <ListPageFilter
          data={data}
          loaded={loaded}
          rowFilters={filters}
          onFilterChange={onFilterChange}
        />
        <DiskTableTitle />
        <VirtualizedTable
          data={filteredData}
          unfilteredData={data}
          loaded={loaded}
          loadError={loadError}
          columns={columns}
          Row={DiskRow}
        />
      </ListPageBody>
    </>
  );
};

export default DiskList;
