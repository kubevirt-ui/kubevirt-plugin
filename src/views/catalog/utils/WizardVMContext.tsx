import * as React from 'react';

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

type WizardVMContextType = {
  /** the vm used for the wizard */
  vm?: V1VirtualMachine;
  /**
   * update the VirtualMachine used for the wizard
   * @param vm V1VirtualMachine
   */
  updateVM?: React.Dispatch<React.SetStateAction<V1VirtualMachine>>;
};

export const useWizardVM = (): WizardVMContextType => {
  const [vm, updateVM] = React.useState<V1VirtualMachine>(getSessionStorageVM());

  React.useEffect(() => {
    // whenever the vm changes, save the vm in session storage
    if (vm) {
      setSessionStorageVM(vm);
    }
  }, [vm]);

  return {
    vm,
    updateVM,
  };
};

export const WizardVMContext = React.createContext<WizardVMContextType>({});

export const WizardVMContextProvider: React.FC = ({ children }) => {
  const context = useWizardVM();
  return <WizardVMContext.Provider value={context}>{children}</WizardVMContext.Provider>;
};

export const useWizardVMContext = () => React.useContext(WizardVMContext);
