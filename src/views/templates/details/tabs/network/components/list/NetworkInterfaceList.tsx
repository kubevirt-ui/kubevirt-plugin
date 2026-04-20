import React, { FCC, useMemo } from 'react';

import { V1Template } from '@kubevirt-ui-ext/kubevirt-api/console';
import KubevirtTable from '@kubevirt-utils/components/KubevirtTable/KubevirtTable';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getTemplateVirtualMachineObject } from '@kubevirt-utils/resources/template';
import { getInterfaces, getNetworks } from '@kubevirt-utils/resources/vm';
import { getNetworkInterfaceRowData } from '@kubevirt-utils/resources/vm/utils/network/rowData';
import { ListPageFilter, useListPageFilter } from '@openshift-console/dynamic-plugin-sdk';

import useNetworkRowFilters from '../../hooks/useNetworkRowFilters';

import {
  getTemplateNetworkColumns,
  getTemplateNetworkRowId,
  TemplateNetworkCallbacks,
} from './templateNetworkInterfaceDefinition';

type NetworkInterfaceListProps = {
  template: V1Template;
};

const NetworkInterfaceList: FCC<NetworkInterfaceListProps> = ({ template }) => {
  const { t } = useKubevirtTranslation();
  const vm = getTemplateVirtualMachineObject(template);
  const networks = getNetworks(vm);
  const interfaces = getInterfaces(vm);
  const filters = useNetworkRowFilters();

  const networkInterfacesData = getNetworkInterfaceRowData(networks, interfaces);
  const [data, filteredData, onFilterChange] = useListPageFilter(networkInterfacesData, filters);

  const columns = useMemo(() => getTemplateNetworkColumns(t), [t]);
  const callbacks: TemplateNetworkCallbacks = useMemo(() => ({ template }), [template]);

  return (
    <>
      <ListPageFilter
        data={data}
        loaded={true}
        onFilterChange={onFilterChange}
        rowFilters={filters}
      />
      <KubevirtTable
        ariaLabel={t('Template network interfaces table')}
        callbacks={callbacks}
        columns={columns}
        data={filteredData}
        dataTest="template-network-interfaces-table"
        fixedLayout
        getRowId={getTemplateNetworkRowId}
        initialSortKey="name"
        loaded={true}
        noDataMsg={t('No network interfaces found')}
        unfilteredData={data}
      />
    </>
  );
};

export default NetworkInterfaceList;
