import React, { FC, useMemo } from 'react';

import { VirtualMachineInstanceModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getInterfaces, getNetworks } from '@kubevirt-utils/resources/vm';
import { getNetworkInterfaceRowData } from '@kubevirt-utils/resources/vm/utils/network/rowData';
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
  const vmiExists = printableVMStatus.Stopped !== vm?.status?.printableStatus;

  const [vmi] = useK8sWatchResource<V1VirtualMachineInstance>(
    vmiExists && {
      groupVersionKind: VirtualMachineInstanceModelGroupVersionKind,
      isList: false,
      name: vm?.metadata?.name,
      namespace: vm?.metadata?.namespace,
    },
  );

  const [networks, interfaces] = useMemo(
    () =>
      vmiExists
        ? [vmi?.spec?.networks, vmi?.spec?.domain?.devices?.interfaces]
        : [getNetworks(vm), getInterfaces(vm)],
    [vm, vmi, vmiExists],
  );

  const filters = useNetworkRowFilters();

  const networkInterfacesData = getNetworkInterfaceRowData(networks, interfaces);
  const [data, filteredData, onFilterChange] = useListPageFilter(networkInterfacesData, filters);

  const columns = useNetworkColumns(filteredData);

  const autoattachPodInterface =
    vm?.spec?.template?.spec?.domain?.devices?.autoattachPodInterface !== false;

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
        rowData={{ vm }}
        unfilteredData={data}
      />
    </>
  );
};

export default NetworkInterfaceList;
