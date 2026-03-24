import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getCPU, getMemory } from '@kubevirt-utils/resources/vm';
import { getVMINodeName } from '@kubevirt-utils/resources/vmi';
import { SortByDirection } from '@patternfly/react-table';
import { getVirtualMachineStorageClasses } from '@virtualmachines/utils/mappers';

import {
  getCPUUsagePercentage,
  getMemoryUsagePercentage,
  getNetworkUsagePercentage,
} from './metrics';
import { VMCallbacks } from './virtualMachinesDefinition';

const createVMSort = (
  compareFn: (a: V1VirtualMachine, b: V1VirtualMachine, callbacks?: VMCallbacks) => number,
) => {
  return (
    data: V1VirtualMachine[],
    direction: SortByDirection,
    callbacks?: VMCallbacks,
  ): V1VirtualMachine[] => {
    return [...data].sort((a, b) => {
      const result = compareFn(a, b, callbacks);
      return direction === SortByDirection.asc ? result : -result;
    });
  };
};

const createNullSafeSort = (
  extractor: (vm: V1VirtualMachine, callbacks?: VMCallbacks) => number | string | undefined,
  isString = false,
) => {
  return createVMSort((a, b, callbacks) => {
    const valA = extractor(a, callbacks);
    const valB = extractor(b, callbacks);

    // Use nullish checks for numbers (preserves 0), falsy checks for strings
    const aEmpty = isString ? !valA : valA == null;
    const bEmpty = isString ? !valB : valB == null;

    if (aEmpty && bEmpty) return 0;
    if (aEmpty) return 1;
    if (bEmpty) return -1;

    return isString
      ? (valA as string).localeCompare(valB as string)
      : (valA as number) - (valB as number);
  });
};

export const sortByNode = createNullSafeSort(
  (vm, callbacks) => getVMINodeName(callbacks?.getVmi(vm)),
  true,
);

export const sortByMemoryUsage = createNullSafeSort((vm, callbacks) =>
  getMemoryUsagePercentage(vm, getMemory(callbacks?.getVmi(vm))),
);

export const sortByCPUUsage = createNullSafeSort((vm, callbacks) =>
  getCPUUsagePercentage(vm, getCPU(callbacks?.getVmi(vm))),
);

export const sortByNetworkUsage = createNullSafeSort((vm) => getNetworkUsagePercentage(vm));

export const sortByStorageClass = createNullSafeSort(
  (vm, callbacks) =>
    callbacks?.pvcMapper ? getVirtualMachineStorageClasses(vm, callbacks.pvcMapper)[0] : undefined,
  true,
);
