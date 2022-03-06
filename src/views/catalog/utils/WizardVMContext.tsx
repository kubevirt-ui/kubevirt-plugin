import * as React from 'react';

import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';

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

export type WizardVMContextType = {
  /** the vm used for the wizard */
  vm?: V1VirtualMachine;
  /**
   * update the VirtualMachine used for the wizard
   * @param vm V1VirtualMachine
   */
  updateVM?: (vm: V1VirtualMachine) => Promise<void>;
  /** loaded state of the vm context */
  loaded?: boolean;
  /** error state of the vm context */
  error?: any;
};

export const useWizardVM = (): WizardVMContextType => {
  const [vm, setVM] = React.useState<V1VirtualMachine>(getSessionStorageVM());
  const [loaded, setLoaded] = React.useState(true);
  const [error, setError] = React.useState<any>();

  const updateVM = (updatedVM: V1VirtualMachine) => {
    setLoaded(false);
    setError(undefined);

    // validate the updated vm with the backend (dry run)
    return k8sCreate<V1VirtualMachine>({
      model: VirtualMachineModel,
      data: updatedVM,
      queryParams: {
        dryRun: 'All',
        fieldManager: 'kubectl-create',
      },
    })
      .then(setVM)
      .catch(setError)
      .finally(() => setLoaded(true));
  };

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
