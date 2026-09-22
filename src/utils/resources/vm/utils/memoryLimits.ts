import xbytes from 'xbytes';

import {
  type K8sIoApimachineryPkgApiResourceQuantity,
  type V1VirtualMachine,
  type V1VirtualMachineInstance,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';

import { getCPU, getDomain, getMemory } from './selectors';

const quantityToMemoryString = (
  quantity: K8sIoApimachineryPkgApiResourceQuantity | undefined,
): string | undefined => {
  if (quantity === undefined) return undefined;

  return quantity.toString();
};

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

/**
 * Checks whether memory limits leave insufficient headroom for hypervisor overhead.
 * Per KubeVirt docs, limits.memory must account for guest RAM plus virt-launcher overhead.
 * Guaranteed VMs (dedicatedCpuPlacement) are exempt.
 */
export const hasRiskyMemoryLimits = (
  vm: V1VirtualMachine,
  vmi?: V1VirtualMachineInstance,
  guestMemoryOverride?: string,
): boolean => {
  const domain = getDomain(vm);
  const memoryLimits = domain?.resources?.limits?.['memory'];
  const guestMemory = guestMemoryOverride ?? domain?.memory?.guest ?? getMemory(vm);
  const memoryOverhead = getVMIMemoryOverhead(vmi);

  if (!memoryLimits || !guestMemory) return false;
  if (getCPU(vm)?.dedicatedCpuPlacement) return false;

  const limitsBytes = parseMemoryToBytes(memoryLimits);
  const guestBytes = parseMemoryToBytes(guestMemory);
  const overheadBytes = parseMemoryToBytes(memoryOverhead) ?? 0;

  if (limitsBytes === null || guestBytes === null) return false;

  return limitsBytes <= guestBytes + overheadBytes;
};
