import React, { FC, useMemo } from 'react';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import {
  getPrintableNetworkInterfaceType,
  hasAutoAttachedPodNetwork,
  isPodNetwork,
} from '@kubevirt-utils/resources/vm/utils/network/selectors';
import { getInterfacesAndNetworks } from '@kubevirt-utils/resources/vm/utils/network/utils';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  ListPageFilter,
  useListPageFilter,
  VirtualizedTable,
} from '@openshift-console/dynamic-plugin-sdk';

import useNetworkColumns from '../../hooks/useNetworkColumns';
import useNetworkRowFilters from '../../hooks/useNetworkRowFilters';
import { SimpleNICPresentation } from '../../utils/types';
import {
  isInterfaceEphemeral,
  isPendingNICAdd,
  isPendingNICRemoval,
  isSRIOVInterface,
} from '../../utils/utils';

import AutoAttachedNetworkEmptyState from './AutoAttachedNetworkEmptyState';
import NetworkInterfaceRow from './NetworkInterfaceRow';

type NetworkInterfaceTableProps = {
  vm: V1VirtualMachine;
  vmi: V1VirtualMachineInstance;
};

const NetworkInterfaceList: FC<NetworkInterfaceTableProps> = ({ vm, vmi }) => {
  const filters = useNetworkRowFilters();
  const autoattachPodInterface = hasAutoAttachedPodNetwork(vm);

  const networkInterfacesData: SimpleNICPresentation[] = useMemo(
    () =>
      getInterfacesAndNetworks(vm, vmi)
        .map(({ config, runtime }) => {
          const isPending =
            isPendingNICAdd(vm, vmi, runtime?.network?.name) ||
            isPendingNICRemoval(vm, vmi, runtime?.network?.name);
          const isAutoAttached =
            autoattachPodInterface && !isPending && !config && isPodNetwork(runtime?.network);

          return {
            config,
            configLinkState: config?.iface?.state,
            iface: {
              macAddress:
                runtime?.status?.mac ?? runtime?.iface?.macAddress ?? config?.iface?.macAddress,
              model: runtime?.iface?.model ?? config?.iface?.model,
            },
            interfaceName: runtime?.status?.interfaceName,
            isAutoAttached,
            isInterfaceEphemeral: !!isInterfaceEphemeral(runtime?.network, runtime?.status),
            isPending,
            isSRIOV: isSRIOVInterface(config?.iface),
            network: {
              multus: runtime?.network?.multus ?? config?.network?.multus,
              name: runtime?.network?.name ?? config?.network?.name,
              pod: runtime?.network?.pod ?? config?.network?.pod,
            },
            runtimeLinkState: runtime?.status?.linkState,
            type: getPrintableNetworkInterfaceType(runtime?.iface ?? config?.iface),
          };
        })
        .map((obj) => ({ ...obj, metadata: { name: obj.network?.name } })),
    [vm, vmi, autoattachPodInterface],
  );

  const [data, filteredData, onFilterChange] = useListPageFilter(networkInterfacesData, filters);

  const columns = useNetworkColumns();

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
        rowData={{ vm, vmi }}
        unfilteredData={data}
      />
    </>
  );
};

export default NetworkInterfaceList;
