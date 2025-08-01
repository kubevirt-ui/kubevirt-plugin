import { useMemo } from 'react';

import { VirtualMachineModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import {
  V1VirtualMachine,
  V1VirtualMachineInstanceMigration,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import useKubevirtWatchResource from '@kubevirt-utils/hooks/useKubevirtWatchResource/useKubevirtWatchResource';
import { RowFilter } from '@openshift-console/dynamic-plugin-sdk';
import { OBJECTS_FETCHING_LIMIT } from '@virtualmachines/utils/constants';

import { PVCMapper, VMIMapper, VMIMMapper } from '../../../utils/mappers';
import { getLatestMigrationForEachVM } from '../../../utils/utils';
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
import { useVirtualMachineInstanceMapper } from '../useVirtualMachineInstanceMapper';

import { useNodesFilter } from './useNodesFilter';
import { useProjectFilter } from './useProjectFilter';
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

  const [vms] = useKubevirtWatchResource<V1VirtualMachine[]>({
    groupVersionKind: VirtualMachineModelGroupVersionKind,
    isList: true,
    limit: OBJECTS_FETCHING_LIMIT,
  });

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
