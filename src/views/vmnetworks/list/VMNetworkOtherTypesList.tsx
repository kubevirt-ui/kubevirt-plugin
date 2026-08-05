import React, { FC, useMemo } from 'react';

import KubevirtFilterToolbar from '@kubevirt-utils/components/KubevirtFilterToolbar/KubevirtFilterToolbar';
import KubevirtTable from '@kubevirt-utils/components/KubevirtTable/KubevirtTable';
import StateHandler from '@kubevirt-utils/components/StateHandler/StateHandler';
import useKubevirtDataViewFilters from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/useKubevirtDataViewFilters';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { ListPageBody } from '@openshift-console/dynamic-plugin-sdk';
import { EmptyState } from '@patternfly/react-core';

import useOtherVMNetworkFilters from './hooks/useOtherVMNetworkFilters';
import useOtherVMNetworks from './hooks/useOtherVMNetworks';
import {
  getVMNetworkOtherRowId,
  getVMNetworkOtherTypesColumns,
} from './vmNetworkOtherTypesListDefinition';

const VMNetworkOtherTypesList: FC = () => {
  const { t } = useKubevirtTranslation();

  const [data, loaded, error] = useOtherVMNetworks();
  const filterDefinitions = useOtherVMNetworkFilters();
  const { clearAllFilters, filteredData, filters, onSetFilters } = useKubevirtDataViewFilters({
    data,
    filterDefinitions,
  });
  const columns = useMemo(() => getVMNetworkOtherTypesColumns(t), [t]);

  return (
    <StateHandler error={error} hasData={!!data} loaded={loaded} showSkeletonLoading withBullseye>
      {loaded && isEmpty(data) ? (
        <EmptyState headingLevel="h4" titleText={t('No other virtual machine networks found')} />
      ) : (
        <ListPageBody>
          <KubevirtFilterToolbar
            clearAllFilters={clearAllFilters}
            data={data}
            filterDefinitions={filterDefinitions}
            filters={filters}
            loaded={loaded}
            onSetFilters={onSetFilters}
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
            unfilteredData={data}
          />
        </ListPageBody>
      )}
    </StateHandler>
  );
};

export default VMNetworkOtherTypesList;
