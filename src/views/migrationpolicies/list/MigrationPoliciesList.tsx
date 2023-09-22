import React, { FC } from 'react';

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

const MigrationPoliciesList: FC<MigrationPoliciesListProps> = ({ kind }) => {
  const { t } = useKubevirtTranslation();
  const [mps, loaded, loadError] = useK8sWatchResource<V1alpha1MigrationPolicy[]>({
    isList: true,
    kind,
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
          columnLayout={{
            columns: columns?.map(({ additional, id, title }) => ({
              additional,
              id,
              title,
            })),
            id: kind,
            selectedColumns: new Set(activeColumns?.map((col) => col?.id)),
            type: t('MigrationPolicy'),
          }}
          data={unfilteredData}
          loaded={loaded}
          onFilterChange={onFilterChange}
        />
        {isEmpty(mps) && <MigrationPoliciesEmptyState kind={kind} />}
        <VirtualizedTable<V1alpha1MigrationPolicy>
          columns={activeColumns}
          data={data}
          EmptyMsg={() => <></>}
          loaded={loaded}
          loadError={loadError}
          Row={MigrationPoliciesRow}
          unfilteredData={unfilteredData}
        />
      </ListPageBody>
    </>
  );
};

export default MigrationPoliciesList;
