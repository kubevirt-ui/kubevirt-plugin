import React, { FC } from 'react';

import StateHandler from '@kubevirt-utils/components/StateHandler/StateHandler';
import { ClusterUserDefinedNetworkKind } from '@kubevirt-utils/resources/udn/types';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  ListPageBody,
  ListPageFilter,
  useListPageFilter,
  VirtualizedTable,
} from '@openshift-console/dynamic-plugin-sdk';

import useVMNetworks from '../hooks/useVMNetworks';

import LocalnetEmptyState from './components/LocalnetEmptyState/LocalnetEmptyState';
import VMNetworkRow from './components/VMNetworkRow';
import useVMNetworkColumns from './hooks/useVMNetworkColumns';

type VMNetworkListProps = {
  onCreate: () => void;
};

const VMNetworkList: FC<VMNetworkListProps> = ({ onCreate }) => {
  const [vmNetworks, loaded, error] = useVMNetworks();
  const [data, filteredData, onFilterChange] = useListPageFilter(vmNetworks);
  const columns = useVMNetworkColumns();

  return (
    <StateHandler error={error} hasData={!!data} loaded={loaded} showSkeletonLoading withBullseye>
      {isEmpty(data) ? (
        <LocalnetEmptyState onCreate={onCreate} />
      ) : (
        <ListPageBody>
          <ListPageFilter data={data} loaded={loaded} onFilterChange={onFilterChange} />
          <VirtualizedTable<ClusterUserDefinedNetworkKind>
            columns={columns}
            data={filteredData}
            loaded={loaded}
            loadError={error}
            Row={VMNetworkRow}
            unfilteredData={data}
          />
        </ListPageBody>
      )}
    </StateHandler>
  );
};

export default VMNetworkList;
