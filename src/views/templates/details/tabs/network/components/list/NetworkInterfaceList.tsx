import React, { FC, useMemo } from 'react';

import KubevirtFilterToolbar from '@kubevirt-utils/components/KubevirtFilterToolbar/KubevirtFilterToolbar';
import KubevirtTable from '@kubevirt-utils/components/KubevirtTable/KubevirtTable';
import useKubevirtDataViewFilters from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/useKubevirtDataViewFilters';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getTemplateVirtualMachineObject, Template } from '@kubevirt-utils/resources/template';
import { getInterfaces, getNetworks } from '@kubevirt-utils/resources/vm';
import { getNetworkInterfaceRowData } from '@kubevirt-utils/resources/vm/utils/network/rowData';

import useNetworkRowFilters from '../../hooks/useNetworkRowFilters';

import {
  getTemplateNetworkColumns,
  getTemplateNetworkRowId,
  TemplateNetworkCallbacks,
} from './templateNetworkInterfaceDefinition';

type NetworkInterfaceListProps = {
  template: Template;
};

const NetworkInterfaceList: FC<NetworkInterfaceListProps> = ({ template }) => {
  const { t } = useKubevirtTranslation();
  const vm = getTemplateVirtualMachineObject(template);
  const networks = getNetworks(vm);
  const interfaces = getInterfaces(vm);
  const filterDefinitions = useNetworkRowFilters();

  const networkInterfacesData = getNetworkInterfaceRowData(networks, interfaces);

  const { clearAllFilters, filteredData, filters, onSetFilters } = useKubevirtDataViewFilters({
    data: networkInterfacesData,
    filterDefinitions,
    hideLabelFilter: true,
  });

  const columns = useMemo(() => getTemplateNetworkColumns(t), [t]);
  const callbacks: TemplateNetworkCallbacks = useMemo(() => ({ template }), [template]);

  return (
    <>
      <KubevirtFilterToolbar
        clearAllFilters={clearAllFilters}
        data={networkInterfacesData}
        filterDefinitions={filterDefinitions}
        filters={filters}
        hideLabelFilter
        loaded
        onSetFilters={onSetFilters}
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
        unfilteredData={networkInterfacesData}
      />
    </>
  );
};

export default NetworkInterfaceList;
