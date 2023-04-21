import React from 'react';

import { MigrationPolicyModelRef } from '@kubevirt-ui/kubevirt-api/console';
import { V1alpha1MigrationPolicy } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  ListPageBody,
  ListPageFilter,
  ListPageHeader,
  useK8sWatchResource,
  useListPageFilter,
  VirtualizedTable,
} from '@openshift-console/dynamic-plugin-sdk';

import MigrationPoliciesCreateButton from './components/MigrationPoliciesCreateButton/MigrationPoliciesCreateButton';
import MigrationPoliciesEmptyState from './components/MigrationPoliciesEmptyState/MigrationPoliciesEmptyState';
import MigrationPoliciesRow from './components/MigrationPoliciesRow/MigrationPoliciesRow';
import useMigrationPoliciesListColumns from './hooks/useMigrationPoliciesListColumns';

type MigrationPoliciesListProps = {
  kind: string;
};

const MigrationPoliciesList: React.FC<MigrationPoliciesListProps> = ({ kind }) => {
  const { t } = useKubevirtTranslation();
  const [mps, loaded, loadError] = useK8sWatchResource<V1alpha1MigrationPolicy[]>({
    kind,
    isList: true,
    namespaced: false,
  });

  const [columns, activeColumns] = useMigrationPoliciesListColumns();
  const [unfilteredData, data, onFilterChange] = useListPageFilter(mps);

  return (
    <>
      <ListPageHeader title={t('MigrationPolicies')}>
        {!isEmpty(mps) && <MigrationPoliciesCreateButton kind={kind} />}
      </ListPageHeader>

      <ListPageBody>
        <ListPageFilter
          data={unfilteredData}
          loaded={loaded}
          onFilterChange={onFilterChange}
          columnLayout={{
            columns: columns?.map(({ id, title, additional }) => ({
              id,
              title,
              additional,
            })),
            id: MigrationPolicyModelRef,
            selectedColumns: new Set(activeColumns?.map((col) => col?.id)),
            type: t('DataSource'),
          }}
        />
        <VirtualizedTable<V1alpha1MigrationPolicy>
          data={data}
          unfilteredData={unfilteredData}
          loaded={loaded}
          loadError={loadError}
          columns={activeColumns}
          Row={MigrationPoliciesRow}
          EmptyMsg={() => <MigrationPoliciesEmptyState kind={kind} />}
        />
      </ListPageBody>
    </>
  );
};

export default MigrationPoliciesList;
