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

import useVMNetworks from '../hooks/useVMNetworks';

import LocalnetEmptyState from './components/LocalnetEmptyState/LocalnetEmptyState';
import { getVMNetworkListColumns, getVMNetworkRowId } from './vmNetworkListDefinition';

type VMNetworkListProps = {
  onCreate: () => void;
};

const VMNetworkList: FC<VMNetworkListProps> = ({ onCreate }) => {
  const { t } = useKubevirtTranslation();
  const [vmNetworks, loaded, error] = useVMNetworks();
  const [data, filteredData, onFilterChange] = useListPageFilter(vmNetworks);
  const columns = useMemo(() => getVMNetworkListColumns(t), [t]);

  return (
    <StateHandler error={error} hasData={!!data} loaded={loaded} showSkeletonLoading withBullseye>
      {loaded && isEmpty(data) ? (
        <LocalnetEmptyState onCreate={onCreate} />
      ) : (
        <ListPageBody>
          <ListPageFilter data={data} loaded={loaded} onFilterChange={onFilterChange} />
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
            unfilteredData={data}
          />
        </ListPageBody>
      )}
    </StateHandler>
  );
};

export default VMNetworkList;
