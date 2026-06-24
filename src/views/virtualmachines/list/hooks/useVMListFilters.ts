import { useMemo } from 'react';

import { VirtualMachineModelGroupVersionKind } from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import useClusterFilter from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/filters/useClusterFilter';
import useProjectFilter from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/filters/useProjectFilter';
import { KubevirtFilter } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useNamespaceParam from '@kubevirt-utils/hooks/useNamespaceParam';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import useIsACMPage from '@multicluster/useIsACMPage';
import { useAccessibleResources } from '@virtualmachines/search/hooks/useAccessibleResources';
import { PVCMapper, VMIMapper } from '@virtualmachines/utils/mappers';

import { getCPUFilter } from '../filters/getCPUFilter';
import { getDateFromFilter, getDateToFilter } from '../filters/getDateFilter';
import { getDescriptionFilter } from '../filters/getDescriptionFilter';
import { getGuestAgentFilter } from '../filters/getGuestAgentFilter';
import { getHWDevicesFilter } from '../filters/getHWDevicesFilter';
import { getIPFilter } from '../filters/getIPFilter';
import { getMemoryFilter } from '../filters/getMemoryFilter';
import { getNADsFilter } from '../filters/getNADsFilter';
import { getOSFilter } from '../filters/getOSFilter';
import { getSchedulingFilter } from '../filters/getSchedulingFilter';
import { getStatusFilter } from '../filters/getStatusFilter';
import useArchitectureFilter from '../filters/useArchitectureFilter';
import useNodeFilter from '../filters/useNodeFilter';
import useStorageClassFilter from '../filters/useStorageClassFilter';

import { useInstanceTypeMapper } from './useInstanceTypeMapper';

const useVMListFilters = (
  vmiMapper: VMIMapper,
  pvcMapper: PVCMapper,
): KubevirtFilter<V1VirtualMachine>[] => {
  const { t } = useKubevirtTranslation();
  const isACMPage = useIsACMPage();
  const cluster = useClusterParam();
  const namespace = useNamespaceParam();

  const { resources: vms } = useAccessibleResources<V1VirtualMachine>({
    groupVersionKind: VirtualMachineModelGroupVersionKind,
  });
  const { instanceTypeMapper } = useInstanceTypeMapper();

  const clusterFilter = useClusterFilter();
  const projectFilter = useProjectFilter();
  const nodeFilter = useNodeFilter(vmiMapper);
  const storageClassFilter = useStorageClassFilter(vms, pvcMapper);
  const architectureFilter = useArchitectureFilter(vms);

  return useMemo(() => {
    const filters: KubevirtFilter<V1VirtualMachine>[] = [];

    if (isACMPage) {
      filters.push({
        ...clusterFilter,
        disabled: Boolean(cluster),
        disabledTooltip: t(
          'Cluster is already selected. To update filters, choose another project or cluster in the tree view.',
        ),
        showAllBadge: true,
        toggleBadgeNumber: Boolean(cluster) ? 1 : undefined,
      });
    }

    filters.push(
      {
        ...projectFilter,
        disabled: Boolean(namespace),
        disabledTooltip: t(
          'Project is already selected. To update filters, choose another project or cluster in the tree view.',
        ),
        showAllBadge: true,
        toggleBadgeNumber: Boolean(namespace) ? 1 : undefined,
      },
      getStatusFilter(t),
      getOSFilter(t),
      storageClassFilter,
      getHWDevicesFilter(t),
      getSchedulingFilter(t),
      nodeFilter,
      getGuestAgentFilter(t),
      getDescriptionFilter(t),
      getCPUFilter(t, vmiMapper, instanceTypeMapper),
      getMemoryFilter(t, vmiMapper, instanceTypeMapper),
      getDateFromFilter(t),
      getDateToFilter(t),
      architectureFilter,
      getIPFilter(t, vmiMapper),
      getNADsFilter(t),
    );

    return filters;
  }, [
    t,
    isACMPage,
    cluster,
    namespace,
    clusterFilter,
    projectFilter,
    storageClassFilter,
    nodeFilter,
    vmiMapper,
    instanceTypeMapper,
    architectureFilter,
  ]);
};

export default useVMListFilters;
