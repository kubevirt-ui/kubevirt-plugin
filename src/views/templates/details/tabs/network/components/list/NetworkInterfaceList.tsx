import * as React from 'react';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { getTemplateVirtualMachineObject } from '@kubevirt-utils/resources/template';
import { getInterfaces, getNetworks } from '@kubevirt-utils/resources/vm';
import { getNetworkInterfaceRowData } from '@kubevirt-utils/resources/vm/utils/network/rowData';
import {
  ListPageFilter,
  useListPageFilter,
  VirtualizedTable,
} from '@openshift-console/dynamic-plugin-sdk';

import useNetworkColumns from '../../hooks/useNetworkColumns';
import useNetworkRowFilters from '../../hooks/useNetworkRowFilters';

import NetworkInterfaceRow from './NetworkInterfaceRow';

type NetworkInterfaceListProps = {
  template: V1Template;
};

const NetworkInterfaceList: React.FC<NetworkInterfaceListProps> = ({ template }) => {
  const vm = getTemplateVirtualMachineObject(template);
  const networks = getNetworks(vm);
  const interfaces = getInterfaces(vm);
  const filters = useNetworkRowFilters();

  const networkInterfacesData = getNetworkInterfaceRowData(networks, interfaces);
  const [data, filteredData, onFilterChange] = useListPageFilter(networkInterfacesData, filters);

  const columns = useNetworkColumns(filteredData);
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
        rowData={{ template }}
      />
    </>
  );
};

export default NetworkInterfaceList;
