import {
  type V1VirtualMachine,
  type V1VirtualMachineInstance,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { isEqualObject } from '@kubevirt-utils/components/NodeSelectorModal/utils/helpers';
import {
  getInstanceTypeNameFromAnnotation,
  isInstanceTypeVM,
} from '@kubevirt-utils/resources/instancetype/helper';
import { getCPU, getCPUSockets, getMemory } from '@kubevirt-utils/resources/vm';
import { getVMIBootDisk } from '@kubevirt-utils/resources/vmi/utils/discs';
import { getVMIBootLoader } from '@kubevirt-utils/resources/vmi/utils/selectors';
import { isEmpty } from '@kubevirt-utils/utils/utils';

import { getBootDisk, getBootloader, getDisks } from '../../../resources/vm/utils/selectors';

export const checkInstanceTypeChanged = (
  vm: V1VirtualMachine,
  vmi: V1VirtualMachineInstance,
): boolean => {
  if (isEmpty(vm) || isEmpty(vmi)) {
    return false;
  }
  return vm.spec?.instancetype?.name !== getInstanceTypeNameFromAnnotation(vmi);
};

export const checkCPUMemoryChanged = (
  vm: V1VirtualMachine,
  vmi: V1VirtualMachineInstance,
): boolean => {
  if (isEmpty(vm) || isEmpty(vmi)) {
    return false;
  }
  const vmMemory = getMemory(vm);
  const vmCPUSockets = getCPUSockets(vm);

  const vmiMemory = getMemory(vmi) || '';
  const vmiCPUSockets = getCPUSockets(vmi);

  return vmMemory !== vmiMemory || vmCPUSockets !== vmiCPUSockets;
};

export const checkBootOrderChanged = (
  vm: V1VirtualMachine,
  vmi: V1VirtualMachineInstance,
): boolean => {
  if (isEmpty(vm) || isEmpty(vmi) || isEmpty(getDisks(vm))) {
    return false;
  }

  const vmBootDisk = getBootDisk(vm);
  const vmiBootDisk = getVMIBootDisk(vmi);

  return vmBootDisk?.name !== vmiBootDisk?.name;
};

export const checkBootModeChanged = (
  vm: V1VirtualMachine,
  vmi: V1VirtualMachineInstance,
): boolean => {
  if (isEmpty(vm) || isEmpty(vmi)) {
    return false;
  }
  const vmiBootloader = getVMIBootLoader(vmi);
  const vmBootloader = getBootloader(vm);
  const usesDefaultBootloader = !vmBootloader;
  return !usesDefaultBootloader && !isEqualObject(vmiBootloader, vmBootloader);
};

export const getChangedDedicatedResources = (
  vm: V1VirtualMachine,
  vmi: V1VirtualMachineInstance,
  currentSelection: boolean,
): boolean => {
  if (isEmpty(vm) || isEmpty(vmi) || isInstanceTypeVM(vm)) {
    return false;
  }
  const vmDedicatedResources = getCPU(vm)?.dedicatedCpuPlacement || false;
  const vmiDedicatedResources = getCPU(vmi)?.dedicatedCpuPlacement || false;

  return (
    vmDedicatedResources !== vmiDedicatedResources || currentSelection !== vmiDedicatedResources
  );
};
