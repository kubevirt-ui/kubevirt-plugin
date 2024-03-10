import React, { FC } from 'react';

import {
  MigrationPolicyModelGroupVersionKind,
  MigrationPolicyModelRef,
} from '@kubevirt-ui/kubevirt-api/console';
import { V1alpha1MigrationPolicy } from '@kubevirt-ui/kubevirt-api/kubevirt';
import ListPageFilter from '@kubevirt-utils/components/ListPageFilter/ListPageFilter';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  ListPageBody,
  ListPageHeader,
  useK8sWatchResource,
  useListPageFilter,
  VirtualizedTable,
} from '@openshift-console/dynamic-plugin-sdk';

import MigrationPoliciesCreateButton from './components/MigrationPoliciesCreateButton/MigrationPoliciesCreateButton';
import MigrationPoliciesEmptyState from './components/MigrationPoliciesEmptyState/MigrationPoliciesEmptyState';
import MigrationPoliciesRow from './components/MigrationPoliciesRow/MigrationPoliciesRow';
import useMigrationPoliciesListColumns from './hooks/useMigrationPoliciesListColumns';

const MigrationPoliciesList: FC = () => {
  const { t } = useKubevirtTranslation();
  const [mps, loaded, loadError] = useK8sWatchResource<V1alpha1MigrationPolicy[]>({
    groupVersionKind: MigrationPolicyModelGroupVersionKind,
    isList: true,
    namespaced: false,
  });

  const [columns, activeColumns, loadedColumns] = useMigrationPoliciesListColumns();
  const [unfilteredData, data, onFilterChange] = useListPageFilter(mps);

  return (
    <>
      <ListPageHeader title={t('MigrationPolicies')}>
        {!isEmpty(mps) && <MigrationPoliciesCreateButton />}
      </ListPageHeader>

      <ListPageBody>
        <ListPageFilter
          columnLayout={{
            columns: columns?.map(({ additional, id, title }) => ({
              additional,
              id,
              title,
            })),
            id: MigrationPolicyModelRef,
            selectedColumns: new Set(activeColumns?.map((col) => col?.id)),
            type: t('MigrationPolicy'),
          }}
          data={unfilteredData}
          loaded={loaded && loadedColumns}
          onFilterChange={onFilterChange}
        />
        {loaded && isEmpty(mps) && <MigrationPoliciesEmptyState />}
        <VirtualizedTable<V1alpha1MigrationPolicy>
          columns={activeColumns}
          data={data}
          EmptyMsg={() => <></>}
          loaded={loaded && loadedColumns}
          loadError={loadError}
          Row={MigrationPoliciesRow}
          unfilteredData={unfilteredData}
        />
      </ListPageBody>
    </>
  );
};

export default MigrationPoliciesList;
