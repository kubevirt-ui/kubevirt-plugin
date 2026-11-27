import type {
  V1PanicDevice,
  V1VirtualMachine,
  V1VirtualMachineInstance,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';

import { getDomain } from './domainSelectors';

export const getPanicDevices = (
  obj: V1VirtualMachine | V1VirtualMachineInstance,
): V1PanicDevice[] | undefined => getDomain(obj)?.devices?.panicDevices;

/** True when at least one panic device has a configured model. */
export const hasConfiguredPanicDevices = (
  obj: V1VirtualMachine | V1VirtualMachineInstance,
): boolean => {
  const panicDevices = getPanicDevices(obj);
  return Boolean(panicDevices?.some((device) => Boolean(device?.model)));
};

/** Whether panic detection is explicitly enabled on the VM spec. */
export const isPanicDetectionEnabled = (vm: V1VirtualMachine): boolean =>
  hasConfiguredPanicDevices(vm);
