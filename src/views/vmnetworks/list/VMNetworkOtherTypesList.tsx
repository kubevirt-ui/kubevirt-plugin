import React, { FC, useMemo } from 'react';

import KubevirtTable from '@kubevirt-utils/components/KubevirtTable/KubevirtTable';
import StateHandler from '@kubevirt-utils/components/StateHandler/StateHandler';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  ListPageBody,
  ListPageFilter,
  useListPageFilter,
} from '@openshift-console/dynamic-plugin-sdk';
import { EmptyState } from '@patternfly/react-core';

import useOtherVMNetworkFilters from './hooks/useOtherVMNetworkFilters';
import useOtherVMNetworks from './hooks/useOtherVMNetworks';
import {
  getVMNetworkOtherRowId,
  getVMNetworkOtherTypesColumns,
} from './vmNetworkOtherTypesListDefinition';

const VMNetworkOtherTypesList: FC = () => {
  const { t } = useKubevirtTranslation();

  const [otherVMNetworks, loaded, error] = useOtherVMNetworks();
  const filters = useOtherVMNetworkFilters();
  const [data, filteredData, onFilterChange] = useListPageFilter(otherVMNetworks, filters);
  const columns = useMemo(() => getVMNetworkOtherTypesColumns(t), [t]);

  return (
    <StateHandler error={error} hasData={!!data} loaded={loaded} showSkeletonLoading withBullseye>
      {isEmpty(data) ? (
        <EmptyState headingLevel="h4" titleText={t('No other virtual machine networks found')} />
      ) : (
        <ListPageBody>
          <ListPageFilter
            data={data}
            hideLabelFilter
            loaded={loaded}
            onFilterChange={onFilterChange}
            rowFilters={filters}
          />
          <KubevirtTable
            ariaLabel={t('Other VM Networks table')}
            columns={columns}
            data={filteredData}
            dataTest="vmnetwork-other-list"
            fixedLayout
            getRowId={getVMNetworkOtherRowId}
            initialSortKey="name"
            loaded={loaded}
            loadError={error}
            noFilteredDataEmptyText={t('No results match the current filters')}
            unfilteredData={data}
          />
        </ListPageBody>
      )}
    </StateHandler>
  );
};

export default VMNetworkOtherTypesList;
