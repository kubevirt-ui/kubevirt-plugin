import React from 'react';

import { V1alpha1MigrationPolicy } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  ListPageBody,
  ListPageCreate,
  ListPageFilter,
  ListPageHeader,
  useK8sWatchResource,
  useListPageFilter,
  VirtualizedTable,
} from '@openshift-console/dynamic-plugin-sdk';

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

  const columns = useMigrationPoliciesListColumns();
  const [unfilteredData, data, onFilterChange] = useListPageFilter(mps);

  return (
    <>
      <ListPageHeader title={t('MigrationPolicies')}>
        <ListPageCreate groupVersionKind={kind}>{t('Create MigrationPolicy')}</ListPageCreate>
      </ListPageHeader>
      <ListPageBody>
        <ListPageFilter data={unfilteredData} loaded={loaded} onFilterChange={onFilterChange} />
        <VirtualizedTable<V1alpha1MigrationPolicy>
          data={data}
          unfilteredData={unfilteredData}
          loaded={loaded}
          loadError={loadError}
          columns={columns}
          Row={MigrationPoliciesRow}
          //   EmptyMsg={() => <MigrationPoliciesEmptyState />} TODO
        />
      </ListPageBody>
    </>
  );
};

export default MigrationPoliciesList;
