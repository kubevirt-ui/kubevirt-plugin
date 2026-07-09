import React, { FC, useMemo } from 'react';

import { VirtualMachineInstanceModelGroupVersionKind } from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1VirtualMachineInstance } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import KubevirtFilterToolbar from '@kubevirt-utils/components/KubevirtFilterToolbar/KubevirtFilterToolbar';
import KubevirtTable from '@kubevirt-utils/components/KubevirtTable/KubevirtTable';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import useKubevirtDataViewFilters from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/useKubevirtDataViewFilters';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import { ListPageBody, ListPageHeader } from '@openshift-console/dynamic-plugin-sdk';

import VirtualMachineInstanceEmptyState from './components/VirtualMachineInstanceEmptyState/VirtualMachineInstanceEmptyState';
import useVMIListFilters from './hooks/useVMIListFilters';
import { getVMIColumns, getVMIRowId, VMI_COLUMN_KEYS } from './virtualMachinesInstancesDefinition';

type VirtualMachinesInstancesListProps = {
  namespace: string;
};

const VirtualMachinesInstancesList: FC<VirtualMachinesInstancesListProps> = ({ namespace }) => {
  const { t } = useKubevirtTranslation();
  const cluster = useClusterParam();

  const [vmis, loaded, loadError] = useK8sWatchData<V1VirtualMachineInstance[]>({
    cluster,
    groupVersionKind: VirtualMachineInstanceModelGroupVersionKind,
    isList: true,
    namespace,
  });

  const filterDefinitions = useVMIListFilters();
  const { clearAllFilters, filteredData, filters, onSetFilters } = useKubevirtDataViewFilters({
    data: vmis ?? [],
    filterDefinitions,
  });

  const columns = useMemo(() => getVMIColumns(t, namespace), [t, namespace]);

  return (
    <>
      <ListPageHeader title={t('VirtualMachineInstances')} />
      <ListPageBody>
        <KubevirtFilterToolbar
          clearAllFilters={clearAllFilters}
          data={vmis}
          filterDefinitions={filterDefinitions}
          filters={filters}
          loaded={loaded}
          onSetFilters={onSetFilters}
        />
        <KubevirtTable<V1VirtualMachineInstance>
          ariaLabel={t('VirtualMachineInstances table')}
          columns={columns}
          data={filteredData ?? []}
          getRowId={getVMIRowId}
          initialSortKey={VMI_COLUMN_KEYS.name}
          loaded={loaded}
          loadError={loadError}
          noDataMsg={
            <VirtualMachineInstanceEmptyState
              cluster={cluster}
              namespace={namespace || DEFAULT_NAMESPACE}
            />
          }
          unfilteredData={vmis}
        />
      </ListPageBody>
    </>
  );
};

export default VirtualMachinesInstancesList;
