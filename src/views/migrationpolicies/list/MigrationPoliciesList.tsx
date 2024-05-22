import React, { FC } from 'react';

import { MigrationPolicyModelRef } from '@kubevirt-ui/kubevirt-api/console';
import { V1alpha1MigrationPolicy } from '@kubevirt-ui/kubevirt-api/kubevirt';
import ListPageFilter from '@kubevirt-utils/components/ListPageFilter/ListPageFilter';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useMigrationPolicies from '@kubevirt-utils/hooks/useMigrationPolicies';
import { ListPageProps } from '@kubevirt-utils/utils/types';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  ListPageBody,
  ListPageHeader,
  useListPageFilter,
  VirtualizedTable,
} from '@openshift-console/dynamic-plugin-sdk';

import MigrationPoliciesCreateButton from './components/MigrationPoliciesCreateButton/MigrationPoliciesCreateButton';
import MigrationPoliciesEmptyState from './components/MigrationPoliciesEmptyState/MigrationPoliciesEmptyState';
import MigrationPoliciesRow from './components/MigrationPoliciesRow/MigrationPoliciesRow';
import useMigrationPoliciesListColumns from './hooks/useMigrationPoliciesListColumns';

const MigrationPoliciesList: FC<ListPageProps> = ({
  fieldSelector,
  hideColumnManagement,
  hideNameLabelFilters,
  hideTextFilter,
  nameFilter,
  selector,
  showTitle,
}) => {
  const { t } = useKubevirtTranslation();
  const [mps, loaded, loadError] = useMigrationPolicies(fieldSelector, selector);

  const [columns, activeColumns, loadedColumns] = useMigrationPoliciesListColumns();
  const [unfilteredData, data, onFilterChange] = useListPageFilter(mps, null, {
    name: { selected: [nameFilter] },
  });

  if (loaded && isEmpty(unfilteredData)) {
    return <MigrationPoliciesEmptyState />;
  }

  return (
    <>
      <ListPageHeader title={!(showTitle === false) && t('MigrationPolicies')}>
        <MigrationPoliciesCreateButton />
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
          hideColumnManagement={hideColumnManagement}
          hideLabelFilter={hideTextFilter}
          hideNameLabelFilters={hideNameLabelFilters}
          loaded={loaded && loadedColumns}
          onFilterChange={onFilterChange}
        />
        <VirtualizedTable<V1alpha1MigrationPolicy>
          EmptyMsg={() => (
            <div className="pf-u-text-align-center">{t('No MigrationPolicies found')}</div>
          )}
          columns={activeColumns}
          data={data}
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
