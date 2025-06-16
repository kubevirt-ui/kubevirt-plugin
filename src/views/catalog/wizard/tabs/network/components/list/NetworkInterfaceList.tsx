import * as React from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import useNetworkColumns from '@kubevirt-utils/hooks/useNetworkColums';
import {
  getAutoAttachPodInterface,
  getInterfaces,
  getNetworks,
} from '@kubevirt-utils/resources/vm';
import { getNetworkInterfaceRowData } from '@kubevirt-utils/resources/vm/utils/network/rowData';
import {
  ListPageFilter,
  useListPageFilter,
  VirtualizedTable,
} from '@openshift-console/dynamic-plugin-sdk';

import useNetworkRowFilters from '../../hooks/useNetworkRowFilters';

import NetworkInterfaceRow from './NetworkInterfaceRow';

type NetworkInterfaceListProps = {
  onUpdateVM?: (updateVM: V1VirtualMachine) => Promise<void>;
  vm: V1VirtualMachine;
};

const NetworkInterfaceList: React.FC<NetworkInterfaceListProps> = ({ onUpdateVM, vm }) => {
  const networks = getNetworks(vm);
  const interfaces = getInterfaces(vm);
  const filters = useNetworkRowFilters();

  const networkInterfacesData = getNetworkInterfaceRowData(
    networks,
    interfaces,
    getAutoAttachPodInterface(vm),
  );
  const [data, filteredData, onFilterChange] = useListPageFilter(networkInterfacesData, filters);

  const columns = useNetworkColumns();
  return (
    <>
      <ListPageFilter data={data} loaded onFilterChange={onFilterChange} rowFilters={filters} />
      <VirtualizedTable
        columns={columns}
        data={filteredData}
        loaded
        loadError={false}
        Row={NetworkInterfaceRow}
        rowData={{ onUpdateVM, vm }}
        unfilteredData={data}
      />
    </>
  );
};

export default NetworkInterfaceList;
