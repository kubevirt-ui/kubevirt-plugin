import React, { FC, useMemo } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import KubevirtTable from '@kubevirt-utils/components/KubevirtTable/KubevirtTable';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getInterfaces, getNetworks } from '@kubevirt-utils/resources/vm';
import { getNetworkInterfaceRowData } from '@kubevirt-utils/resources/vm/utils/network/rowData';
import { hasAutoAttachedPodNetwork } from '@kubevirt-utils/resources/vm/utils/network/selectors';
import { ListPageFilter, useListPageFilter } from '@openshift-console/dynamic-plugin-sdk';
import AutoAttachedNetworkEmptyState from '@virtualmachines/details/tabs/configuration/network/components/list/AutoAttachedNetworkEmptyState';

import useNetworkRowFilters from '../../hooks/useNetworkRowFilters';

import {
  getWizardNetworkColumns,
  getWizardNetworkRowId,
  WizardNetworkCallbacks,
} from './wizardNetworkInterfaceDefinition';

type NetworkInterfaceListProps = {
  onUpdateVM?: (updateVM: V1VirtualMachine) => Promise<void>;
  vm: V1VirtualMachine;
};

const NetworkInterfaceList: FC<NetworkInterfaceListProps> = ({ onUpdateVM, vm }) => {
  const { t } = useKubevirtTranslation();
  const networks = getNetworks(vm);
  const interfaces = getInterfaces(vm);
  const filters = useNetworkRowFilters();

  const autoattachPodInterface = hasAutoAttachedPodNetwork(vm);
  const networkInterfacesData = getNetworkInterfaceRowData(networks, interfaces);
  const [data, filteredData, onFilterChange] = useListPageFilter(networkInterfacesData, filters);

  const columns = useMemo(() => getWizardNetworkColumns(t), [t]);
  const callbacks: WizardNetworkCallbacks = useMemo(() => ({ onUpdateVM, vm }), [onUpdateVM, vm]);

  return (
    <>
      <ListPageFilter
        data={data}
        loaded={true}
        onFilterChange={onFilterChange}
        rowFilters={filters}
      />
      <KubevirtTable
        ariaLabel={t('Wizard network interfaces table')}
        callbacks={callbacks}
        columns={columns}
        data={filteredData}
        dataTest="wizard-network-interfaces-table"
        fixedLayout
        getRowId={getWizardNetworkRowId}
        initialSortKey="name"
        loaded={true}
        noDataMsg={<AutoAttachedNetworkEmptyState isAutoAttached={autoattachPodInterface} />}
        unfilteredData={data}
      />
    </>
  );
};

export default NetworkInterfaceList;
