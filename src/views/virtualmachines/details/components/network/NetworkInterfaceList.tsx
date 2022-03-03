import * as React from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import {
  ListPageFilter,
  useListPageFilter,
  VirtualizedTable,
} from '@openshift-console/dynamic-plugin-sdk';

import { getInterfaces, getNetworks } from '../../../utils/selectors';

import useNetworkColumns from './hooks/useNetworkColumns';
import useNetworkRowFilters from './hooks/useNetworkRowFilters';
import { getNetworkInterfaceRowData } from './utils/utils';
import NetworkInterfaceRow from './NetworkInterfaceRow';

type NetworkInterfaceTableProps = {
  vm?: V1VirtualMachine;
};

const NetworkInterfaceList: React.FC<NetworkInterfaceTableProps> = ({ vm }) => {
  const networks = getNetworks(vm);
  const interfaces = getInterfaces(vm);
  const filters = useNetworkRowFilters();

  const networkInterfacesData = getNetworkInterfaceRowData(networks, interfaces);
  const [data, filteredData, onFilterChange] = useListPageFilter(networkInterfacesData, filters);

  const columns = useNetworkColumns();
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
      />
    </>
  );
};

export default NetworkInterfaceList;
