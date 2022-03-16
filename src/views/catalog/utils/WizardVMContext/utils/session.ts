import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';

export const setSessionStorageVM = (value: V1VirtualMachine) => {
  try {
    window.sessionStorage.setItem('wizard-vm-cache', JSON.stringify(value));
  } catch (e) {}
};

export const getSessionStorageVM = (): V1VirtualMachine | undefined => {
  try {
    const value = window.sessionStorage.getItem('wizard-vm-cache');
    return value ? JSON.parse(value) : undefined;
  } catch (e) {
    return undefined;
  }
};

export const clearSessionStorageVM = () => {
  try {
    window.sessionStorage.removeItem('wizard-vm-cache');
  } catch (e) {}
};
