import { VirtualMachineModelGroupVersionKind } from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { useClusterFilter } from '@kubevirt-utils/hooks/useClusterFilter';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useProjectFilter } from '@kubevirt-utils/hooks/useProjectFilter';
import useIsACMPage from '@multicluster/useIsACMPage';
import { RowFilter } from '@openshift-console/dynamic-plugin-sdk';
import { useAccessibleResources } from '@virtualmachines/search/hooks/useAccessibleResources';

import { PVCMapper, VMIMapper } from '../../../utils/mappers';
import { getArchitectureFilter } from '../../utils/filters/getArchitectureFilter';
import { getCPUFilter } from '../../utils/filters/getCPUFilter';
import { getDateFilter } from '../../utils/filters/getDateFilter';
import { getDescriptionFilter } from '../../utils/filters/getDescriptionFilter';
import { getGuestAgentFilter } from '../../utils/filters/getGuestAgentFilter';
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
  const { t } = useKubevirtTranslation();
  const isACMPage = useIsACMPage();

  const { resources: vms } = useAccessibleResources<V1VirtualMachine>(
    VirtualMachineModelGroupVersionKind,
  );

  const clusterFilter = useClusterFilter();
  const projectFilter = useProjectFilter<V1VirtualMachine>();
  const statusFilter = getStatusFilter(t);
  const osFilters = getOSFilter(t);
  const storageClassFilter = useStorageClassFilter(vms, pvcMapper);
  const hwDevicesFilter = getHWDevicesFilter(t);
  const schedulingFilter = getSchedulingFilter(t);
  const nodesFilter = useNodesFilter(vmiMapper);

  const guestAgentFilter = getGuestAgentFilter(t);
  const descriptionFilter = getDescriptionFilter(t);
  const cpuFilter = getCPUFilter(t, vmiMapper);
  const memoryFilter = getMemoryFilter(t, vmiMapper);
  const dateFromFilter = getDateFilter(t, 'from');
  const dateToFilter = getDateFilter(t, 'to');
  const architectureFilter = getArchitectureFilter(t, vms);
  const ipFilter = getIPFilter(t, vmiMapper);
  const nadFilter = getNADsFilter();

  const filtersWithSelect = [
    projectFilter,
    statusFilter,
    osFilters,
    storageClassFilter,
    hwDevicesFilter,
    schedulingFilter,
    nodesFilter,
    guestAgentFilter,
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
