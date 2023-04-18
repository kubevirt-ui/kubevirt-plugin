import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  ListPageFilter,
  useListPageFilter,
  VirtualizedTable,
} from '@openshift-console/dynamic-plugin-sdk';
import {
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateVariant,
} from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';

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
  const { t } = useKubevirtTranslation();
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
        NoDataEmptyMsg={() => (
          <>
            <EmptyState variant={EmptyStateVariant.xs}>
              <EmptyStateIcon className="snapshots-list__empty-state-icon" icon={SearchIcon} />
              <EmptyStateBody>{t('No snapshots found')}</EmptyStateBody>
            </EmptyState>
          </>
        )}
      />
    </>
  );
};

export default SnapshotsList;
