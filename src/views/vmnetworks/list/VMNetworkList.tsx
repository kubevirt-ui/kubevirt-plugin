import React, { FC, useMemo } from 'react';

import KubevirtFilterToolbar from '@kubevirt-utils/components/KubevirtFilterToolbar/KubevirtFilterToolbar';
import KubevirtTable from '@kubevirt-utils/components/KubevirtTable/KubevirtTable';
import StateHandler from '@kubevirt-utils/components/StateHandler/StateHandler';
import useKubevirtDataViewFilters from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/useKubevirtDataViewFilters';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { ListPageBody } from '@openshift-console/dynamic-plugin-sdk';

import useVMNetworks from '../hooks/useVMNetworks';

import LocalnetEmptyState from './components/LocalnetEmptyState/LocalnetEmptyState';
import { getVMNetworkListColumns, getVMNetworkRowId } from './vmNetworkListDefinition';

type VMNetworkListProps = {
  onCreate: () => void;
};

const VMNetworkList: FC<VMNetworkListProps> = ({ onCreate }) => {
  const { t } = useKubevirtTranslation();
  const [vmNetworks, loaded, error] = useVMNetworks();
  const { clearAllFilters, filteredData, filters, onSetFilters } = useKubevirtDataViewFilters({
    data: vmNetworks ?? [],
  });
  const columns = useMemo(() => getVMNetworkListColumns(t), [t]);

  return (
    <StateHandler
      error={error}
      hasData={!!vmNetworks}
      loaded={loaded}
      showSkeletonLoading
      withBullseye
    >
      {loaded && isEmpty(vmNetworks) ? (
        <LocalnetEmptyState onCreate={onCreate} />
      ) : (
        <ListPageBody>
          <KubevirtFilterToolbar
            clearAllFilters={clearAllFilters}
            filters={filters}
            loaded={loaded}
            onSetFilters={onSetFilters}
          />
          <KubevirtTable
            ariaLabel={t('VM Networks table')}
            columns={columns}
            data={filteredData}
            dataTest="vmnetwork-list"
            fixedLayout
            getRowId={getVMNetworkRowId}
            initialSortKey="name"
            loaded={loaded}
            loadError={error}
            persistSortInUrl
            unfilteredData={vmNetworks}
          />
        </ListPageBody>
      )}
    </StateHandler>
  );
};

export default VMNetworkList;
