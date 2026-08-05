import React, { FC, useMemo } from 'react';

import KubevirtFilterToolbar from '@kubevirt-utils/components/KubevirtFilterToolbar/KubevirtFilterToolbar';
import KubevirtTable from '@kubevirt-utils/components/KubevirtTable/KubevirtTable';
import useKubevirtDataViewFilters from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/useKubevirtDataViewFilters';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import { UseSnapshotData } from '../../hooks/useSnapshotData';
import { getSnapshotFilters } from '../../utils/filters';

import {
  getSnapshotListColumns,
  getSnapshotRowId,
  SnapshotListCallbacks,
} from './snapshotListDefinition';

type SnapshotsListProps = UseSnapshotData & { isVMRunning?: boolean };

const SnapshotsList: FC<SnapshotsListProps> = ({
  error,
  isVMRunning,
  loaded,
  restoresMap,
  snapshots,
}) => {
  const { t } = useKubevirtTranslation();
  const columns = useMemo(() => getSnapshotListColumns(t), [t]);
  const filterDefinitions = useMemo(() => getSnapshotFilters(t), [t]);
  const { clearAllFilters, filteredData, filters, onSetFilters } = useKubevirtDataViewFilters({
    data: snapshots ?? [],
    filterDefinitions,
  });

  const callbacks: SnapshotListCallbacks = useMemo(
    () => ({
      isVMRunning: isVMRunning ?? false,
      restores: restoresMap,
    }),
    [isVMRunning, restoresMap],
  );

  return (
    <>
      <KubevirtFilterToolbar
        clearAllFilters={clearAllFilters}
        data={snapshots}
        filterDefinitions={filterDefinitions}
        filters={filters}
        loaded={loaded}
        onSetFilters={onSetFilters}
      />
      <KubevirtTable
        ariaLabel={t('Snapshots table')}
        callbacks={callbacks}
        columns={columns}
        data={filteredData}
        dataTest="vm-snapshot-list"
        fixedLayout
        getRowId={getSnapshotRowId}
        initialSortKey="name"
        loaded={loaded}
        loadError={error}
        noDataMsg={t('No snapshots found')}
        noFilteredDataMsg={t('No results match the current filters')}
        unfilteredData={snapshots}
      />
    </>
  );
};

export default SnapshotsList;
