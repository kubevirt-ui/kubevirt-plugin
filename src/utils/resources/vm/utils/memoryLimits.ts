import xbytes from 'xbytes';

import {
  type K8sIoApimachineryPkgApiResourceQuantity,
  type V1VirtualMachine,
  type V1VirtualMachineInstance,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';

import { getCPU, getDomain, getMemory } from './selectors';

const quantityToMemoryString = (
  quantity: K8sIoApimachineryPkgApiResourceQuantity | undefined,
): string | undefined => quantity?.toString();

const parseMemoryToBytes = (
  quantity: K8sIoApimachineryPkgApiResourceQuantity | string | undefined,
): null | number => {
  const value = typeof quantity === 'string' ? quantity : quantityToMemoryString(quantity);
  if (!value) return null;

  try {
    return xbytes.parseSize(`${value}B`);
  } catch {
    return null;
  }
};

export const getVMIMemoryOverhead = (vmi: V1VirtualMachineInstance): string | undefined =>
  quantityToMemoryString(vmi?.status?.memory?.memoryOverhead);

export const getVMMemoryLimit = (vm: V1VirtualMachine): string | undefined =>
  quantityToMemoryString(getDomain(vm)?.resources?.limits?.['memory']);

const getComparableMemory = (
  vm: V1VirtualMachine,
  memoryOverhead: string | undefined,
): string | undefined => {
  const domain = getDomain(vm);

  if (memoryOverhead !== undefined) {
    return domain?.memory?.guest?.toString() ?? getMemory(vm);
  }

  return (
    quantityToMemoryString(domain?.resources?.requests?.memory) ??
    domain?.memory?.guest?.toString() ??
    getMemory(vm)
  );
};

/**
 * Checks whether memory limits leave insufficient headroom for hypervisor overhead.
 * Per KubeVirt docs, limits.memory must account for guest RAM plus virt-launcher overhead.
 * Guaranteed VMs (dedicatedCpuPlacement) are exempt.
 */
export const hasRiskyMemoryLimits = (
  vm: V1VirtualMachine,
  vmi?: V1VirtualMachineInstance,
): boolean => {
  const memoryLimits = getVMMemoryLimit(vm);
  const memoryOverhead = getVMIMemoryOverhead(vmi);
  const comparableMemory = getComparableMemory(vm, memoryOverhead);

  if (!memoryLimits || !comparableMemory) return false;
  if (getCPU(vm)?.dedicatedCpuPlacement) return false;

  const limitsBytes = parseMemoryToBytes(memoryLimits);
  const comparableBytes = parseMemoryToBytes(comparableMemory);
  const overheadBytes = parseMemoryToBytes(memoryOverhead) ?? 0;

  if (limitsBytes === null || comparableBytes === null) return false;

  return limitsBytes <= comparableBytes + overheadBytes;
};
