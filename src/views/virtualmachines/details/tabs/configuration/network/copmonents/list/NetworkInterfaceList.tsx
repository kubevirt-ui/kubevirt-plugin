import React, { FC } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getInterfaces, getNetworks } from '@kubevirt-utils/resources/vm';
import { getNetworkInterfaceRowData } from '@kubevirt-utils/resources/vm/utils/network/rowData';
import {
  ListPageFilter,
  useListPageFilter,
  VirtualizedTable,
} from '@openshift-console/dynamic-plugin-sdk';

import useNetworkColumns from '../..//hooks/useNetworkColumns';
import useNetworkRowFilters from '../../hooks/useNetworkRowFilters';

import AutoAttachedNetworkEmptyState from './AutoAttachedNetworkEmptyState';
import NetworkInterfaceRow from './NetworkInterfaceRow';

type NetworkInterfaceTableProps = {
  vm: V1VirtualMachine;
};

const NetworkInterfaceList: FC<NetworkInterfaceTableProps> = ({ vm }) => {
  const networks = getNetworks(vm);
  const interfaces = getInterfaces(vm);
  const filters = useNetworkRowFilters();

  const networkInterfacesData = getNetworkInterfaceRowData(networks, interfaces);
  const [data, filteredData, onFilterChange] = useListPageFilter(networkInterfacesData, filters);

  const columns = useNetworkColumns(filteredData);

  const autoattachPodInterface =
    vm?.spec?.template?.spec?.domain?.devices?.autoattachPodInterface !== false;

  return (
    <>
      <ListPageFilter data={data} loaded rowFilters={filters} onFilterChange={onFilterChange} />
      <VirtualizedTable
        data={filteredData}
        unfilteredData={data}
        loaded
        loadError={false}
        columns={columns}
        Row={NetworkInterfaceRow}
        rowData={{ vm }}
        EmptyMsg={() => (
          <AutoAttachedNetworkEmptyState vm={vm} isAutoAttached={autoattachPodInterface} />
        )}
      />
    </>
  );
};

export default NetworkInterfaceList;
