import React, { FC, useMemo } from 'react';

import { V1VirtualMachineInstance } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import DiskListTitle from '@kubevirt-utils/components/DiskListTitle/DiskListTitle';
import KubevirtFilterToolbar from '@kubevirt-utils/components/KubevirtFilterToolbar/KubevirtFilterToolbar';
import KubevirtTable from '@kubevirt-utils/components/KubevirtTable/KubevirtTable';
import useKubevirtDataViewFilters from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/useKubevirtDataViewFilters';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ListPageBody } from '@openshift-console/dynamic-plugin-sdk';

import useDisksTableDisks from '../../hooks/useDisksTableDisks';
import { getVMIDiskFilters } from '../../utils/filters';

import { getVMIDiskRowId, getVMIDisksTableColumns } from './disksTableDefinition';

type DisksTableProps = {
  vmi: V1VirtualMachineInstance;
};

const DisksTable: FC<DisksTableProps> = ({ vmi }) => {
  const { t } = useKubevirtTranslation();
  const columns = useMemo(() => getVMIDisksTableColumns(t), [t]);
  const [disks, loaded, loadingError] = useDisksTableDisks(vmi);
  const filterDefinitions = useMemo(() => getVMIDiskFilters(t), [t]);
  const { clearAllFilters, filteredData, filters, onSetFilters } = useKubevirtDataViewFilters({
    data: disks ?? [],
    filterDefinitions,
    hideLabelFilter: true,
  });

  return (
    <ListPageBody>
      <DiskListTitle className="pf-v6-u-mb-md" />
      <KubevirtFilterToolbar
        clearAllFilters={clearAllFilters}
        data={disks}
        filterDefinitions={filterDefinitions}
        filters={filters}
        hideLabelFilter
        loaded={loaded}
        onSetFilters={onSetFilters}
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
        unfilteredData={disks}
      />
    </ListPageBody>
  );
};

export default DisksTable;
