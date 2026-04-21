import React, { FC, useMemo } from 'react';

import KubevirtTable from '@kubevirt-utils/components/KubevirtTable/KubevirtTable';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ListPageFilter, useListPageFilter } from '@openshift-console/dynamic-plugin-sdk';

import { UseSnapshotData } from '../../hooks/useSnapshotData';
import { filters } from '../../utils/filters';

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
  const [data, filteredData, onFilterChange] = useListPageFilter(snapshots, filters);

  const callbacks: SnapshotListCallbacks = useMemo(
    () => ({
      isVMRunning: isVMRunning ?? false,
      restores: restoresMap,
    }),
    [isVMRunning, restoresMap],
  );

  return (
    <>
      <ListPageFilter
        data={data}
        loaded={loaded}
        onFilterChange={onFilterChange}
        rowFilters={filters}
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
        unfilteredData={data}
      />
    </>
  );
};

export default SnapshotsList;
