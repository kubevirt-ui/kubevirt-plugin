import { VirtualMachineModelGroupVersionKind } from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { useClusterFilter } from '@kubevirt-utils/hooks/useClusterFilter';
import useKubevirtWatchResource from '@kubevirt-utils/hooks/useKubevirtWatchResource/useKubevirtWatchResource';
import { useProjectFilter } from '@kubevirt-utils/hooks/useProjectFilter';
import useIsACMPage from '@multicluster/useIsACMPage';
import { RowFilter } from '@openshift-console/dynamic-plugin-sdk';
import { OBJECTS_FETCHING_LIMIT } from '@virtualmachines/utils/constants';

import { PVCMapper, VMIMapper } from '../../../utils/mappers';
import { getArchitectureFilter } from '../../utils/filters/getArchitectureFilter';
import { getCPUFilter } from '../../utils/filters/getCPUFilter';
import { getDateFilter } from '../../utils/filters/getDateFilter';
import { getDescriptionFilter } from '../../utils/filters/getDescriptionFilter';
import { getHWDevicesFilter } from '../../utils/filters/getHWDevicesFilter';
import { getIPFilter } from '../../utils/filters/getIPFilter';
import { getMemoryFilter } from '../../utils/filters/getMemoryFilter';
import { getNADsFilter } from '../../utils/filters/getNADsFilter';
import { getOSFilter } from '../../utils/filters/getOSFilter';
import { getSchedulingFilter } from '../../utils/filters/getSchedulingFilter';
import { getStatusFilter } from '../../utils/filters/getStatusFilter';

import { useNodesFilter } from './useNodesFilter';
import { useStorageClassFilter } from './useStorageClassFilter';

export const useVMListFilters = (
  vmiMapper: VMIMapper,
  pvcMapper: PVCMapper,
): {
  filtersWithSelect: RowFilter<V1VirtualMachine>[];
  hiddenFilters: RowFilter<V1VirtualMachine>[];
} => {
  const isACMPage = useIsACMPage();

  const [vms] = useKubevirtWatchResource<V1VirtualMachine[]>({
    groupVersionKind: VirtualMachineModelGroupVersionKind,
    isList: true,
    limit: OBJECTS_FETCHING_LIMIT,
  });

  const clusterFilter = useClusterFilter();
  const projectFilter = useProjectFilter();
  const statusFilter = getStatusFilter();
  const osFilters = getOSFilter();
  const storageClassFilter = useStorageClassFilter(vms, pvcMapper);
  const hwDevicesFilter = getHWDevicesFilter();
  const schedulingFilter = getSchedulingFilter();
  const nodesFilter = useNodesFilter(vmiMapper);

  const descriptionFilter = getDescriptionFilter();
  const cpuFilter = getCPUFilter(vmiMapper);
  const memoryFilter = getMemoryFilter(vmiMapper);
  const dateFromFilter = getDateFilter('from');
  const dateToFilter = getDateFilter('to');
  const architectureFilter = getArchitectureFilter(vms);
  const ipFilter = getIPFilter(vmiMapper);
  const nadFilter = getNADsFilter();

  const filtersWithSelect = [
    projectFilter,
    statusFilter,
    osFilters,
    storageClassFilter,
    hwDevicesFilter,
    schedulingFilter,
    nodesFilter,
  ];

  if (isACMPage) filtersWithSelect.unshift(clusterFilter);

  return {
    filtersWithSelect,
    hiddenFilters: [
      descriptionFilter,
      cpuFilter,
      memoryFilter,
      dateFromFilter,
      dateToFilter,
      architectureFilter,
      ipFilter,
      nadFilter,
    ],
  };
};
