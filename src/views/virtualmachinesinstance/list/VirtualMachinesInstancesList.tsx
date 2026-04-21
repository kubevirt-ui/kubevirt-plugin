import React, { FC, useMemo } from 'react';

import { VirtualMachineInstanceModelGroupVersionKind } from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1VirtualMachineInstance } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import KubevirtTable from '@kubevirt-utils/components/KubevirtTable/KubevirtTable';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import { getCatalogURL } from '@multicluster/urls';
import {
  ListPageBody,
  ListPageFilter,
  ListPageHeader,
  useListPageFilter,
} from '@openshift-console/dynamic-plugin-sdk';

import VirtualMachineInstanceEmptyState from './components/VirtualMachineInstanceEmptyState/VirtualMachineInstanceEmptyState';
import { filters } from './utils';
import { getVMIColumns, getVMIRowId, VMI_COLUMN_KEYS } from './virtualMachinesInstancesDefinition';

type VirtualMachinesInstancesListProps = {
  namespace: string;
};

const VirtualMachinesInstancesList: FC<VirtualMachinesInstancesListProps> = ({ namespace }) => {
  const { t } = useKubevirtTranslation();
  const cluster = useClusterParam();
  const catalogURL = getCatalogURL(cluster, namespace || DEFAULT_NAMESPACE);

  const [vmis, loaded, loadError] = useK8sWatchData<V1VirtualMachineInstance[]>({
    cluster,
    groupVersionKind: VirtualMachineInstanceModelGroupVersionKind,
    isList: true,
    namespace,
  });

  const [unfilteredData, filteredData, onFilterChange] = useListPageFilter(vmis, filters);

  const columns = useMemo(() => getVMIColumns(t, namespace), [t, namespace]);

  return (
    <>
      <ListPageHeader title={t('VirtualMachineInstances')} />
      <ListPageBody>
        <ListPageFilter
          data={unfilteredData}
          loaded={loaded}
          onFilterChange={onFilterChange}
          rowFilters={filters}
        />
        <KubevirtTable<V1VirtualMachineInstance>
          ariaLabel={t('VirtualMachineInstances table')}
          columns={columns}
          data={filteredData ?? []}
          getRowId={getVMIRowId}
          initialSortKey={VMI_COLUMN_KEYS.name}
          loaded={loaded}
          loadError={loadError}
          noDataMsg={<VirtualMachineInstanceEmptyState catalogURL={catalogURL} />}
          unfilteredData={unfilteredData}
        />
      </ListPageBody>
    </>
  );
};

export default VirtualMachinesInstancesList;
