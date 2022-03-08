import * as React from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useDisksTableData from '@kubevirt-utils/resources/vm/hooks/disk/useDisksTableData';
import {
  ListPageBody,
  ListPageCreateButton,
  ListPageFilter,
  ListPageHeader,
  useListPageFilter,
  VirtualizedTable,
} from '@openshift-console/dynamic-plugin-sdk';

import useDiskColumns from '../../hooks/useDiskColumns';
import useDisksFilters from '../../hooks/useDisksFilters';

import DiskListTitle from './DiskListTitle';
import DiskRow from './DiskRow';

type DiskListProps = {
  vm?: V1VirtualMachine;
};

const DiskList: React.FC<DiskListProps> = ({ vm }) => {
  const { t } = useKubevirtTranslation();
  const columns = useDiskColumns();
  const [disks, loaded, loadError] = useDisksTableData(vm);
  const filters = useDisksFilters();
  const [data, filteredData, onFilterChange] = useListPageFilter(disks, filters);
  return (
    <>
      <ListPageHeader title="">
        <ListPageCreateButton>{t('Add disk')}</ListPageCreateButton>
      </ListPageHeader>
      <ListPageBody>
        <DiskListTitle />
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
      </ListPageBody>
    </>
  );
};

export default DiskList;
