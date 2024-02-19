import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  ListPageFilter,
  useListPageFilter,
  VirtualizedTable,
} from '@openshift-console/dynamic-plugin-sdk';
import {
  EmptyState,
  EmptyStateBody,
  EmptyStateHeader,
  EmptyStateIcon,
  EmptyStateVariant,
} from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';

import useSnapshotColumns from '../../hooks/useSnapshotColumns';
import { UseSnapshotData } from '../../hooks/useSnapshotData';
import { filters } from '../../utils/filters';

import SnapshotRow from './SnapshotRow';

type SnapshotsListProps = UseSnapshotData & { isVMRunning?: boolean };

const SnapshotsList: FC<SnapshotsListProps> = ({
  error,
  isVMRunning,
  loaded,
  restoresMap,
  snapshots,
}) => {
  const columns = useSnapshotColumns();
  const { t } = useKubevirtTranslation();
  const [data, filteredData, onFilterChange] = useListPageFilter(snapshots, filters);

  return (
    <>
      <ListPageFilter
        data={data}
        loaded={loaded}
        onFilterChange={onFilterChange}
        rowFilters={filters}
      />
      <VirtualizedTable
        NoDataEmptyMsg={() => (
          <>
            <EmptyState variant={EmptyStateVariant.xs}>
              <EmptyStateHeader
                icon={
                  <EmptyStateIcon className="snapshots-list__empty-state-icon" icon={SearchIcon} />
                }
              />
              <EmptyStateBody>{t('No snapshots found')}</EmptyStateBody>
            </EmptyState>
          </>
        )}
        columns={columns}
        data={filteredData}
        loaded={loaded}
        loadError={error}
        Row={SnapshotRow}
        rowData={{ isVMRunning, restores: restoresMap }}
        unfilteredData={data}
      />
    </>
  );
};

export default SnapshotsList;
