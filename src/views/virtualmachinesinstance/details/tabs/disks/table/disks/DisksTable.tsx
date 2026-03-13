import React, { FC, useMemo } from 'react';

import { V1VirtualMachineInstance } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import DiskListTitle from '@kubevirt-utils/components/DiskListTitle/DiskListTitle';
import KubevirtTable from '@kubevirt-utils/components/KubevirtTable/KubevirtTable';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  ListPageBody,
  ListPageFilter,
  useListPageFilter,
} from '@openshift-console/dynamic-plugin-sdk';

import useDisksTableDisks from '../../hooks/useDisksTableDisks';
import { filters } from '../../utils/virtualMachinesInstancePageDisksTabUtils';

import { getVMIDiskRowId, getVMIDisksTableColumns } from './disksTableDefinition';

type DisksTableProps = {
  vmi: V1VirtualMachineInstance;
};

const DisksTable: FC<DisksTableProps> = ({ vmi }) => {
  const { t } = useKubevirtTranslation();
  const columns = useMemo(() => getVMIDisksTableColumns(t), [t]);
  const [disks, loaded, loadingError] = useDisksTableDisks(vmi);
  const [data, filteredData, onFilterChange] = useListPageFilter(disks, filters);

  return (
    <ListPageBody>
      <DiskListTitle />
      <ListPageFilter
        data={data}
        hideLabelFilter
        loaded={loaded}
        onFilterChange={onFilterChange}
        rowFilters={filters}
      />
      <KubevirtTable
        ariaLabel={t('Disks table')}
        columns={columns}
        data={filteredData}
        dataTest="vmi-disks-table"
        fixedLayout
        getRowId={getVMIDiskRowId}
        initialSortKey="name"
        loaded={loaded}
        loadError={loadingError}
        noDataMsg={t('No disks found')}
        noFilteredDataMsg={t('No results match the current filters')}
        unfilteredData={data}
      />
    </ListPageBody>
  );
};

export default DisksTable;
