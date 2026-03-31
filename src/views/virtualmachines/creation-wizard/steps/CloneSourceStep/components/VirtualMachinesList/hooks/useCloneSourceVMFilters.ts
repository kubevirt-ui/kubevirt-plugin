import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useProjectFilter } from '@kubevirt-utils/hooks/useProjectFilter';
import { RowFilter } from '@openshift-console/dynamic-plugin-sdk';
import { useNodesFilter } from '@virtualmachines/list/hooks/useVMListFilters/useNodesFilter';
import { useStorageClassFilter } from '@virtualmachines/list/hooks/useVMListFilters/useStorageClassFilter';
import { getArchitectureFilter } from '@virtualmachines/list/utils/filters/getArchitectureFilter';
import { getGuestAgentFilter } from '@virtualmachines/list/utils/filters/getGuestAgentFilter';
import { getHWDevicesFilter } from '@virtualmachines/list/utils/filters/getHWDevicesFilter';
import { getOSFilter } from '@virtualmachines/list/utils/filters/getOSFilter';
import { getSchedulingFilter } from '@virtualmachines/list/utils/filters/getSchedulingFilter';
import { getStatusFilter } from '@virtualmachines/list/utils/filters/getStatusFilter';
import { PVCMapper, VMIMapper } from '@virtualmachines/utils/mappers';

export const useCloneSourceVMFilters = (
  vms: V1VirtualMachine[],
  vmiMapper: VMIMapper,
  pvcMapper: PVCMapper,
): {
  filtersWithSelect: RowFilter<V1VirtualMachine>[];
  rowFilters: RowFilter<V1VirtualMachine>[];
} => {
  const { t } = useKubevirtTranslation();

  // Only project filter shown separately
  const projectFilter = useProjectFilter<V1VirtualMachine>();

  // All other filters grouped into rowFilters dropdown
  const statusFilter = getStatusFilter(t);
  const osFilters = getOSFilter(t);
  const storageClassFilter = useStorageClassFilter(vms, pvcMapper);
  const hwDevicesFilter = getHWDevicesFilter(t);
  const schedulingFilter = getSchedulingFilter(t);
  const nodesFilter = useNodesFilter(vmiMapper);
  const guestAgentFilter = getGuestAgentFilter(t);
  const architectureFilter = getArchitectureFilter(t, vms);

  return {
    filtersWithSelect: [projectFilter],
    rowFilters: [
      statusFilter,
      osFilters,
      storageClassFilter,
      hwDevicesFilter,
      schedulingFilter,
      nodesFilter,
      guestAgentFilter,
      architectureFilter,
    ],
  };
};
