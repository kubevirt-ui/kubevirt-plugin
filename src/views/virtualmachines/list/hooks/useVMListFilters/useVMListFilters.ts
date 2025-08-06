import { useMemo } from 'react';

import { VirtualMachineModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import {
  V1VirtualMachine,
  V1VirtualMachineInstanceMigration,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { RowFilter, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

import { PVCMapper, VMIMapper, VMIMMapper } from '../../../utils/mappers';
import { getLatestMigrationForEachVM } from '../../../utils/utils';
import { useVirtualMachineInstanceMapper } from '../useVirtualMachineInstanceMapper';

import { useArchitectureFilter } from './useArchitectureFilter';
import { useCPUFilter } from './useCPUFilter';
import { useDateFilter } from './useDateFilter';
import { useDescriptionFilter } from './useDescriptionFilter';
import { useHWDevicesFilter } from './useHWDevicesFilter';
import { useIPFilter } from './useIPFilter';
import { useMemoryFilter } from './useMemoryFilter';
import { useNADsFilter } from './useNADsFilter';
import { useNodesFilter } from './useNodesFilter';
import { useOSFilter } from './useOSFilter';
import { useProjectFilter } from './useProjectFilter';
import { useSchedulingFilter } from './useSchedulingFilter';
import { useStatusFilter } from './useStatusFilter';
import { useStorageClassFilter } from './useStorageClassFilter';

export const useVMListFilters = (
  vmims: V1VirtualMachineInstanceMigration[],
  pvcMapper: PVCMapper,
): {
  filtersWithSelect: RowFilter<V1VirtualMachine>[];
  hiddenFilters: RowFilter<V1VirtualMachine>[];
  vmiMapper: VMIMapper;
  vmimMapper: VMIMMapper;
} => {
  const vmiMapper = useVirtualMachineInstanceMapper();

  const vmimMapper: VMIMMapper = useMemo(() => getLatestMigrationForEachVM(vmims), [vmims]);

  const [vms] = useK8sWatchResource<V1VirtualMachine[]>({
    groupVersionKind: VirtualMachineModelGroupVersionKind,
    isList: true,
  });

  const projectFilter = useProjectFilter();
  const statusFilter = useStatusFilter();
  const osFilters = useOSFilter();
  const storageClassFilter = useStorageClassFilter(vms, pvcMapper);
  const hwDevicesFilter = useHWDevicesFilter();
  const schedulingFilter = useSchedulingFilter();
  const nodesFilter = useNodesFilter(vmiMapper);

  const descriptionFilter = useDescriptionFilter();
  const cpuFilter = useCPUFilter(vmiMapper);
  const memoryFilter = useMemoryFilter(vmiMapper);
  const dateFromFilter = useDateFilter('from');
  const dateToFilter = useDateFilter('to');
  const architectureFilter = useArchitectureFilter(vms);
  const ipFilter = useIPFilter(vmiMapper);
  const nadFilter = useNADsFilter();

  return {
    filtersWithSelect: [
      projectFilter,
      statusFilter,
      osFilters,
      storageClassFilter,
      hwDevicesFilter,
      schedulingFilter,
      nodesFilter,
    ],
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
    vmiMapper,
    vmimMapper,
  };
};
