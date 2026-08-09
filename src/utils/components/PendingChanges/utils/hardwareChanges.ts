import {
  type V1Devices,
  type V1VirtualMachine,
  type V1VirtualMachineInstance,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getDevices, getGPUDevices, getHostDevices } from '@kubevirt-utils/resources/vm';
import { getVMIDevices } from '@kubevirt-utils/resources/vmi/utils/selectors';
import { isEmpty } from '@kubevirt-utils/utils/utils';

import { isHeadlessMode } from '../../../resources/vm/utils/selectors';

export const getChangedGPUDevices = (
  vm: V1VirtualMachine,
  vmi: V1VirtualMachineInstance,
): string[] => {
  if (isEmpty(vm) || isEmpty(vmi)) {
    return [];
  }
  const vmGPUDevices = getGPUDevices(vm);
  const vmiGPUDevices = vmi?.spec?.domain?.devices?.gpus;
  const vmGPUDevicesNames = vmGPUDevices?.map((gpu) => gpu?.name);
  const vmiGPUDevicesNames = vmiGPUDevices?.map((gpu) => gpu?.name);
  const unchangedGPUDevices = vmGPUDevicesNames?.filter((vmGPUDeviceName) =>
    vmiGPUDevicesNames?.includes(vmGPUDeviceName),
  );
  const changedGPUDevices = [
    ...(vmGPUDevicesNames?.filter((gpu) => !unchangedGPUDevices?.includes(gpu)) || []),
    ...(vmiGPUDevicesNames?.filter((gpu) => !unchangedGPUDevices?.includes(gpu)) ?? []),
  ];
  return changedGPUDevices;
};

export const getChangedHostDevices = (
  vm: V1VirtualMachine,
  vmi: V1VirtualMachineInstance,
): string[] => {
  if (isEmpty(vm) || isEmpty(vmi)) {
    return [];
  }
  const vmHostDevices = getHostDevices(vm);
  const vmiHostDevices = vmi?.spec?.domain?.devices?.hostDevices;
  const vmHostDevicesNames = vmHostDevices?.map((hostDevice) => hostDevice?.name);
  const vmiHostDevicesNames = vmiHostDevices?.map((hostDevice) => hostDevice?.name);
  const unchangedHostDevices = vmHostDevicesNames?.filter((vmHostDeviceName) =>
    vmiHostDevicesNames?.includes(vmHostDeviceName),
  );
  const changedHostDevices = [
    ...(vmHostDevicesNames?.filter((hostDevice) => !unchangedHostDevices?.includes(hostDevice)) ||
      []),
    ...(vmiHostDevicesNames?.filter((hostDevice) => !unchangedHostDevices?.includes(hostDevice)) ??
      []),
  ];
  return changedHostDevices;
};

export const getChangedGuestSystemAccessLog = (
  vm: V1VirtualMachine,
  vmi: V1VirtualMachineInstance,
): boolean => {
  if (isEmpty(vm) || isEmpty(vmi)) {
    return false;
  }
  const vmLogSerialConsole = (getDevices(vm) as V1Devices & { logSerialConsole: boolean })
    ?.logSerialConsole;
  const vmiLogSerialConsole = (getVMIDevices(vmi) as V1Devices & { logSerialConsole: boolean })
    ?.logSerialConsole;

  return vmLogSerialConsole !== vmiLogSerialConsole;
};

export const getChangedHeadlessMode = (
  vm: V1VirtualMachine,
  vmi: V1VirtualMachineInstance,
): boolean => {
  if (isEmpty(vm) || isEmpty(vmi)) {
    return false;
  }

  return isHeadlessMode(vm) !== isHeadlessMode(vmi);
};
