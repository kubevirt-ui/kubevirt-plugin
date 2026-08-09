import {
  type V1VirtualMachine,
  type V1VirtualMachineInstance,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { isEqualObject } from '@kubevirt-utils/components/NodeSelectorModal/utils/helpers';
import {
  getAffinity,
  getEvictionStrategy,
  getNodeSelector,
  getTolerations,
} from '@kubevirt-utils/resources/vm';
import { getEvictionStrategy as getVMIEvictionStrategy } from '@kubevirt-utils/resources/vmi';
import { isEmpty } from '@kubevirt-utils/utils/utils';

export const getChangedEvictionStrategy = (
  vm: V1VirtualMachine,
  vmi: V1VirtualMachineInstance,
  clusterEvictionStrategy: string,
): boolean => {
  if (isEmpty(vm) || isEmpty(vmi)) {
    return false;
  }
  const vmEvictionStrategy = getEvictionStrategy(vm);
  const vmiEvictionStrategy = getVMIEvictionStrategy(vmi);

  if (!vmEvictionStrategy) return clusterEvictionStrategy !== vmiEvictionStrategy;

  return vmEvictionStrategy !== vmiEvictionStrategy;
};

export const getChangedStartStrategy = (
  vm: V1VirtualMachine,
  vmi: V1VirtualMachineInstance,
): boolean => {
  if (isEmpty(vm) || isEmpty(vmi)) {
    return false;
  }
  const vmStartStrategy = !!vm?.spec?.template?.spec?.startStrategy;
  const vmiStartStrategy = !!vmi?.spec?.startStrategy;
  return vmStartStrategy !== vmiStartStrategy;
};

export const getChangedHostname = (
  vm: V1VirtualMachine,
  vmi: V1VirtualMachineInstance,
): boolean => {
  if (isEmpty(vm) || isEmpty(vmi)) {
    return false;
  }
  const vmHostname = vm?.spec?.template?.spec?.hostname;
  const vmiHostname = vmi?.spec?.hostname;
  return vmHostname !== vmiHostname;
};

export const getChangedNodeSelector = (
  vm: V1VirtualMachine,
  vmi: V1VirtualMachineInstance,
): boolean => {
  if (isEmpty(vm) || isEmpty(vmi)) {
    return false;
  }
  const vmNodeSelector = getNodeSelector(vm) ?? {};
  const vmiNodeSelector = vmi?.spec?.nodeSelector ?? {};

  return !isEqualObject(vmNodeSelector, vmiNodeSelector);
};

export const getChangedTolerations = (
  vm: V1VirtualMachine,
  vmi: V1VirtualMachineInstance,
): boolean => {
  if (isEmpty(vm) || isEmpty(vmi)) {
    return false;
  }
  const vmTolerations = getTolerations(vm) ?? [];
  const vmiTolerations = vmi?.spec?.tolerations ?? [];

  return !isEqualObject(vmTolerations, vmiTolerations);
};

export const getChangedAffinity = (
  vm: V1VirtualMachine,
  vmi: V1VirtualMachineInstance,
): boolean => {
  if (isEmpty(vm) || isEmpty(vmi)) {
    return false;
  }
  const vmAffinity = getAffinity(vm) ?? {};
  const vmiAffinity = vmi?.spec?.affinity ?? {};

  return !isEqualObject(vmAffinity, vmiAffinity);
};
