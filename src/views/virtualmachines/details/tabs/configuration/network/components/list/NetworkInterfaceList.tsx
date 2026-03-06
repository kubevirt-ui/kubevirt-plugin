import React, { FC, useMemo } from 'react';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import KubevirtTable from '@kubevirt-utils/components/KubevirtTable/KubevirtTable';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  getPrintableNetworkInterfaceType,
  hasAutoAttachedPodNetwork,
} from '@kubevirt-utils/resources/vm/utils/network/selectors';
import { getInterfacesAndNetworks } from '@kubevirt-utils/resources/vm/utils/network/utils';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { ListPageFilter, useListPageFilter } from '@openshift-console/dynamic-plugin-sdk';

import useNetworkRowFilters from '../../hooks/useNetworkRowFilters';
import { SimpleNICPresentation } from '../../utils/types';
import {
  isInterfaceEphemeral,
  isPendingNICAdd,
  isPendingNICRemoval,
  isSRIOVInterface,
} from '../../utils/utils';

import AutoAttachedNetworkEmptyState from './AutoAttachedNetworkEmptyState';
import {
  getNetworkInterfaceListColumns,
  getNetworkInterfaceRowId,
  NetworkInterfaceListCallbacks,
} from './networkInterfaceListDefinition';

type NetworkInterfaceTableProps = {
  vm: V1VirtualMachine;
  vmi?: V1VirtualMachineInstance;
};

const NetworkInterfaceList: FC<NetworkInterfaceTableProps> = ({ vm, vmi }) => {
  const { t } = useKubevirtTranslation();
  const filters = useNetworkRowFilters();
  const columns = useMemo(() => getNetworkInterfaceListColumns(t), [t]);

  const networkInterfacesData: SimpleNICPresentation[] = useMemo(
    () =>
      getInterfacesAndNetworks(vm, vmi)
        .map(({ config, runtime }) => ({
          config,
          configLinkState: config?.iface?.state,
          iface: {
            macAddress:
              runtime?.status?.mac ?? runtime?.iface?.macAddress ?? config?.iface?.macAddress,
            model: runtime?.iface?.model ?? config?.iface?.model,
          },
          interfaceName: runtime?.status?.interfaceName,
          isInterfaceEphemeral: !!isInterfaceEphemeral(runtime?.network, runtime?.status),
          isPending:
            isPendingNICAdd(vm, vmi, runtime?.network?.name) ||
            isPendingNICRemoval(vm, vmi, runtime?.network?.name),
          isSRIOV: isSRIOVInterface(config?.iface),
          network: {
            multus: runtime?.network?.multus ?? config?.network?.multus,
            name: runtime?.network?.name ?? config?.network?.name,
            pod: runtime?.network?.pod ?? config?.network?.pod,
          },
          runtimeLinkState: runtime?.status?.linkState,
          type: getPrintableNetworkInterfaceType(runtime?.iface ?? config?.iface),
        }))
        .map((obj) => ({ ...obj, metadata: { name: obj.network?.name } })),
    [vm, vmi],
  );

  const [data, filteredData, onFilterChange] = useListPageFilter(networkInterfacesData, filters);

  const autoattachPodInterface = hasAutoAttachedPodNetwork(vm);

  const callbacks: NetworkInterfaceListCallbacks = useMemo(() => ({ vm, vmi }), [vm, vmi]);

  return (
    <>
      <ListPageFilter data={data} loaded onFilterChange={onFilterChange} rowFilters={filters} />
      <KubevirtTable
        ariaLabel={t('Network interfaces table')}
        callbacks={callbacks}
        columns={columns}
        data={filteredData}
        dataTest="vm-network-interface-list"
        fixedLayout
        getRowId={getNetworkInterfaceRowId}
        initialSortKey="name"
        loaded={!isEmpty(vm)}
        noDataEmptyMsg={<AutoAttachedNetworkEmptyState isAutoAttached={autoattachPodInterface} />}
        noFilteredDataEmptyText={t('No results match the current filters')}
        unfilteredData={data}
      />
    </>
  );
};

export default NetworkInterfaceList;
