import * as React from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';

import { getSessionStorageVM, setSessionStorageVM } from './utils/session';
import { UpdateValidatedVM, useValidatedVM } from './useValidatedVm';

export type WizardVMContextType = {
  /** the vm used for the wizard */
  vm?: V1VirtualMachine;
  /**
   * update the VirtualMachine used for the wizard
   * @param vm V1VirtualMachine
   */
  updateVM?: UpdateValidatedVM;
  /** loaded state of the vm context */
  loaded?: boolean;
  /** error state of the vm context */
  error?: any;
};

export const useWizardVM = (): WizardVMContextType => {
  const { vm, updateVM, loaded, error } = useValidatedVM(getSessionStorageVM());

  React.useEffect(() => {
    // whenever the vm changes, save the vm in session storage
    if (vm) {
      setSessionStorageVM(vm);
    }
  }, [vm]);

  return {
    vm,
    updateVM,
    loaded,
    error,
  };
};

export const WizardVMContext = React.createContext<WizardVMContextType>({});

export const WizardVMContextProvider: React.FC = ({ children }) => {
  const context = useWizardVM();
  return <WizardVMContext.Provider value={context}>{children}</WizardVMContext.Provider>;
};

export const useWizardVMContext = () => React.useContext(WizardVMContext);
