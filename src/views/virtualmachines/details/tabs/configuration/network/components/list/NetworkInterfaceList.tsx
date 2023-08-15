import React, { FC } from 'react';

import { VirtualMachineInstanceModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import {
  V1Network,
  V1VirtualMachine,
  V1VirtualMachineInstance,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getAutoAttachPodInterface } from '@kubevirt-utils/resources/vm';
import { getNetworkInterfaceRowData } from '@kubevirt-utils/resources/vm/utils/network/rowData';
import { getInterfacesAndNetworks } from '@kubevirt-utils/resources/vm/utils/network/utils';
import { getVMINetworks } from '@kubevirt-utils/resources/vmi/utils/selectors';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  ListPageFilter,
  useK8sWatchResource,
  useListPageFilter,
  VirtualizedTable,
} from '@openshift-console/dynamic-plugin-sdk';
import { printableVMStatus } from '@virtualmachines/utils';

import useNetworkColumns from '../../hooks/useNetworkColumns';
import useNetworkRowFilters from '../../hooks/useNetworkRowFilters';

import AutoAttachedNetworkEmptyState from './AutoAttachedNetworkEmptyState';
import NetworkInterfaceRow from './NetworkInterfaceRow';

type NetworkInterfaceTableProps = {
  vm: V1VirtualMachine;
};

const NetworkInterfaceList: FC<NetworkInterfaceTableProps> = ({ vm }) => {
  const filters = useNetworkRowFilters();

  const vmiExists = printableVMStatus.Stopped !== vm?.status?.printableStatus;
  const [vmi] = useK8sWatchResource<V1VirtualMachineInstance>(
    vmiExists && {
      groupVersionKind: VirtualMachineInstanceModelGroupVersionKind,
      isList: false,
      name: getName(vm),
      namespace: getNamespace(vm),
    },
  );

  const { interfaces, networks } = getInterfacesAndNetworks(vm, vmi);

  const networkInterfacesData = getNetworkInterfaceRowData(networks, interfaces);
  const [data, filteredData, onFilterChange] = useListPageFilter(networkInterfacesData, filters);

  const columns = useNetworkColumns(filteredData);

  const autoattachPodInterface = getAutoAttachPodInterface(vm) !== false;

  const isPending = (network: V1Network) =>
    getVMINetworks(vmi)?.some((ntwork) => ntwork?.name !== network.name);

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
