import React from 'react';
import { useHistory } from 'react-router-dom';

import { MigrationPolicyModelRef } from '@kubevirt-ui/kubevirt-api/console';
import { V1alpha1MigrationPolicy } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  ListPageBody,
  ListPageCreateDropdown,
  ListPageFilter,
  ListPageHeader,
  useK8sWatchResource,
  useListPageFilter,
  VirtualizedTable,
} from '@openshift-console/dynamic-plugin-sdk';

import MigrationPoliciesEmptyState from './components/MigrationPoliciesEmptyState/MigrationPoliciesEmptyState';
import MigrationPoliciesRow from './components/MigrationPoliciesRow/MigrationPoliciesRow';
import useMigrationPoliciesListColumns from './hooks/useMigrationPoliciesListColumns';
import { migrationPoliciesPageBaseURL } from './utils/constants';

type MigrationPoliciesListProps = {
  kind: string;
};

const MigrationPoliciesList: React.FC<MigrationPoliciesListProps> = ({ kind }) => {
  const { t } = useKubevirtTranslation();
  const history = useHistory();
  const [mps, loaded, loadError] = useK8sWatchResource<V1alpha1MigrationPolicy[]>({
    kind,
    isList: true,
    namespaced: false,
  });

  const [columns, activeColumns] = useMigrationPoliciesListColumns();
  const [unfilteredData, data, onFilterChange] = useListPageFilter(mps);

  const createItems = {
    form: t('With form'),
    yaml: t('With YAML'),
  };

  const onCreate = (type: string) => {
    return type === 'form'
      ? history.push(`${migrationPoliciesPageBaseURL}/form`)
      : history.push(`${migrationPoliciesPageBaseURL}/~new`);
  };

  return (
    <>
      <ListPageHeader title={t('MigrationPolicies')}>
        <ListPageCreateDropdown items={createItems} onClick={onCreate}>
          {t('Create MigrationPolicy')}
        </ListPageCreateDropdown>
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
          EmptyMsg={() => <MigrationPoliciesEmptyState />}
        />
      </ListPageBody>
    </>
  );
};

export default MigrationPoliciesList;
