import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getMemory } from '@kubevirt-utils/resources/vm';
import { columnSortingCompare, isEmpty } from '@kubevirt-utils/utils/utils';
import { SortByDirection } from '@patternfly/react-table';
import { getDeletionProtectionPrintableStatus } from '@virtualmachines/details/tabs/configuration/details/components/DeletionProtection/utils/utils';
import { getVMIFromMapper, VMIMapper } from '@virtualmachines/utils/mappers';

import {
  getCPUUsagePercentage,
  getMemoryUsagePercentage,
  getNetworkUsagePercentage,
} from '../metrics';

export const sortByNode = (
  data: V1VirtualMachine[],
  direction: SortByDirection,
  pagination: { [key: string]: any },
  vmiMapper: VMIMapper,
) => {
  const sortByVMINode = (a: V1VirtualMachine, b: V1VirtualMachine): number => {
    const aNode = getVMIFromMapper(vmiMapper, a)?.status?.nodeName;
    const bNode = getVMIFromMapper(vmiMapper, b)?.status?.nodeName;

    if (isEmpty(aNode)) return -1;
    if (isEmpty(bNode)) return 1;
    return aNode?.localeCompare(bNode);
  };

  return columnSortingCompare(data, direction, pagination, sortByVMINode);
};

export const sortByCPUUsage = (
  data: V1VirtualMachine[],
  direction: SortByDirection,
  pagination: { [key: string]: any },
) => {
  const compareCPUUsage = (a: V1VirtualMachine, b: V1VirtualMachine): number => {
    const cpuUsageA = getCPUUsagePercentage(getName(a), getNamespace(a));
    const cpuUsageB = getCPUUsagePercentage(getName(b), getNamespace(b));

    if (isEmpty(cpuUsageA)) return -1;
    if (isEmpty(cpuUsageB)) return 1;
    return cpuUsageA - cpuUsageB;
  };

  return columnSortingCompare(data, direction, pagination, compareCPUUsage);
};

export const sortByNetworkUsage = (
  data: V1VirtualMachine[],
  direction: SortByDirection,
  pagination: { [key: string]: any },
) => {
  const compareCPUUsage = (a: V1VirtualMachine, b: V1VirtualMachine): number => {
    const networkUsageA = getNetworkUsagePercentage(getName(a), getNamespace(a));
    const networkUsageB = getNetworkUsagePercentage(getName(b), getNamespace(b));

    if (isEmpty(networkUsageA)) return -1;
    if (isEmpty(networkUsageB)) return 1;
    return networkUsageA - networkUsageB;
  };

  return columnSortingCompare(data, direction, pagination, compareCPUUsage);
};

export const sortByMemoryUsage = (
  data: V1VirtualMachine[],
  direction: SortByDirection,
  pagination: { [key: string]: any },
  vmiMapper: VMIMapper,
) => {
  const compareCPUUsage = (a: V1VirtualMachine, b: V1VirtualMachine): number => {
    const aVMI = getVMIFromMapper(vmiMapper, a);
    const bVMI = getVMIFromMapper(vmiMapper, b);
    const memoryUsageA = getMemoryUsagePercentage(getName(a), getNamespace(a), getMemory(aVMI));
    const memoryUsageB = getMemoryUsagePercentage(getName(b), getNamespace(b), getMemory(bVMI));

    if (isEmpty(memoryUsageA)) return -1;
    if (isEmpty(memoryUsageB)) return 1;
    return memoryUsageA - memoryUsageB;
  };

  return columnSortingCompare(data, direction, pagination, compareCPUUsage);
};

export const sortByDeletionProtection = (
  data: V1VirtualMachine[],
  direction: SortByDirection,
  pagination: { [key: string]: any },
) => {
  const compareDeletionProtection = (a: V1VirtualMachine, b: V1VirtualMachine): number => {
    const deletionProtectionStatusA = getDeletionProtectionPrintableStatus(a);
    const deletionProtectionStatusB = getDeletionProtectionPrintableStatus(b);

    return deletionProtectionStatusA?.localeCompare(deletionProtectionStatusB);
  };

  return columnSortingCompare(data, direction, pagination, compareDeletionProtection);
};
