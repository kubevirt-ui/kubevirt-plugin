import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { isEmpty, kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { effect, signal } from '@preact/signals-react';
import { CREATE_VM_WIZARD_SESSION_STORAGE_KEY } from '@virtualmachines/creation-wizard/state/vm-signal/constants';

export const wizardVMSignal = signal<null | V1VirtualMachine>(null);

export const saveWizardVMToSessionStorage = (vm: null | V1VirtualMachine): void => {
  sessionStorage.setItem(CREATE_VM_WIZARD_SESSION_STORAGE_KEY, JSON.stringify(vm));
};

export const getWizardVMFromSessionStorage = (): null | V1VirtualMachine => {
  const vmString = sessionStorage.getItem(CREATE_VM_WIZARD_SESSION_STORAGE_KEY);
  if (!isEmpty(vmString)) {
    try {
      const vm = JSON.parse(vmString);
      return vm;
    } catch (error) {
      kubevirtConsole.error('Error parsing vm session storage:', error);
    }
  }
  return null;
};

effect(() => {
  if (!isEmpty(wizardVMSignal.value)) {
    saveWizardVMToSessionStorage(wizardVMSignal.value);
    return;
  }
  wizardVMSignal.value = getWizardVMFromSessionStorage();
});
