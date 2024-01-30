import React, { FC, useMemo } from 'react';

import {
  V1Network,
  V1VirtualMachine,
  V1VirtualMachineInstance,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getAutoAttachPodInterface } from '@kubevirt-utils/resources/vm';
import { getNetworkInterfaceRowData } from '@kubevirt-utils/resources/vm/utils/network/rowData';
import { getInterfacesAndNetworks } from '@kubevirt-utils/resources/vm/utils/network/utils';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  ListPageFilter,
  useListPageFilter,
  VirtualizedTable,
} from '@openshift-console/dynamic-plugin-sdk';

import useNetworkColumns from '../../hooks/useNetworkColumns';
import useNetworkRowFilters from '../../hooks/useNetworkRowFilters';
import { isPendingHotPlugNIC } from '../../utils/utils';

import AutoAttachedNetworkEmptyState from './AutoAttachedNetworkEmptyState';
import NetworkInterfaceRow from './NetworkInterfaceRow';

type NetworkInterfaceTableProps = {
  vm: V1VirtualMachine;
  vmi: V1VirtualMachineInstance;
};

const NetworkInterfaceList: FC<NetworkInterfaceTableProps> = ({ vm, vmi }) => {
  const filters = useNetworkRowFilters();

  const networkInterfacesData = useMemo(() => {
    const { interfaces, networks } = getInterfacesAndNetworks(vm, vmi);
    return getNetworkInterfaceRowData(networks, interfaces);
  }, [vm, vmi]);

  const [data, filteredData, onFilterChange] = useListPageFilter(networkInterfacesData, filters);

  const columns = useNetworkColumns(filteredData);

  const autoattachPodInterface = getAutoAttachPodInterface(vm) !== false;

  const isPending = (network: V1Network): boolean => isPendingHotPlugNIC(vm, vmi, network?.name);

  return (
    <>
      <ListPageFilter data={data} loaded onFilterChange={onFilterChange} rowFilters={filters} />
      <VirtualizedTable
        columns={columns}
        data={filteredData}
        EmptyMsg={() => <AutoAttachedNetworkEmptyState isAutoAttached={autoattachPodInterface} />}
        loaded={!isEmpty(vm)}
        loadError={false}
        Row={NetworkInterfaceRow}
        rowData={{ isPending, vm }}
        unfilteredData={data}
      />
    </>
  );
};

export default NetworkInterfaceList;
