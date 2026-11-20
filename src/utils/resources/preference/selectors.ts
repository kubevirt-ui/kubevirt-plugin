import type { V1beta1VirtualMachinePreference } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';

export const getPreferredPanicDeviceModel = (
  preference?: V1beta1VirtualMachinePreference,
): string | undefined => preference?.spec?.devices?.preferredPanicDeviceModel;
