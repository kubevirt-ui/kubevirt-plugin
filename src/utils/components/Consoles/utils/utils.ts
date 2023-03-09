import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';

export const isConnectionEncrypted = () => window.location.protocol === 'https:';

export const isHeadlessModeVMI = (vmi: V1VirtualMachineInstance) => {
  const devices = vmi?.spec?.domain?.devices;
  return devices?.hasOwnProperty('autoattachGraphicsDevice') && !devices?.autoattachGraphicsDevice;
};
