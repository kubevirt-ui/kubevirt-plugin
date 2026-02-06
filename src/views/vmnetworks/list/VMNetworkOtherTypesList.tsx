import React, { FC, useMemo } from 'react';

import StateHandler from '@kubevirt-utils/components/StateHandler/StateHandler';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  ListPageBody,
  ListPageFilter,
  useListPageFilter,
  VirtualizedTable,
} from '@openshift-console/dynamic-plugin-sdk';
import { EmptyState } from '@patternfly/react-core';

import VMNetworkOtherRow from './components/VMNetworkOtherRow';
import useOtherVMNetworkFilters from './hooks/useOtherVMNetworkFilters';
import useOtherVMNetworks from './hooks/useOtherVMNetworks';
import { OtherVMNetworkWithType } from './types';

const VMNetworkOtherTypesList: FC = () => {
  const { t } = useKubevirtTranslation();

  const [otherVMNetworks, loaded, error] = useOtherVMNetworks();

  const filters = useOtherVMNetworkFilters();
  const [data, filteredData, onFilterChange] = useListPageFilter(otherVMNetworks, filters);

  const columns = useMemo(
    () => [
      { id: 'name', sort: 'metadata.name', title: t('Name') },
      { id: 'namespace', title: t('Namespace') },
      { id: 'type', sort: 'type', title: t('Type') },
    ],
    [t],
  );

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
          <VirtualizedTable<OtherVMNetworkWithType>
            columns={columns}
            data={filteredData}
            loaded={loaded}
            loadError={error}
            Row={VMNetworkOtherRow}
            unfilteredData={data}
          />
        </ListPageBody>
      )}
    </StateHandler>
  );
};

export default VMNetworkOtherTypesList;
