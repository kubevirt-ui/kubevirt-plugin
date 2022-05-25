import * as React from 'react';
import { Updater, useImmer } from 'use-immer';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';

import { getSessionStorageTabsData, getSessionStorageVM } from './utils/session';
import { TabsData } from './utils/tabs-data';
import { UpdateValidatedVM, useValidatedVM } from './useValidatedVm';
import { useWizardVMEffects } from './useWizardVMEffects';

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
  /** additional tabs data, not related to the vm */
  tabsData?: TabsData;
  /** update tabs data */
  updateTabsData?: Updater<TabsData>;
  /** is the virtual machine creation disabled */
  disableVmCreate?: boolean;
  /** Set the isCreatedDisabled variable */
  setDisableVmCreate?: React.Dispatch<React.SetStateAction<boolean>>;
};

export const useWizardVM = (): WizardVMContextType => {
  const { vm, updateVM, loaded, error } = useValidatedVM(getSessionStorageVM());
  const [tabsData, updateTabsData] = useImmer<TabsData>(getSessionStorageTabsData());
  const [disableVmCreate, setDisableVmCreate] = React.useState(false);

  useWizardVMEffects(vm, tabsData, updateTabsData);

  return {
    vm,
    updateVM,
    loaded,
    error,
    tabsData,
    updateTabsData,
    disableVmCreate,
    setDisableVmCreate,
  };
};

export const WizardVMContext = React.createContext<WizardVMContextType>({});

export const WizardVMContextProvider: React.FC = ({ children }) => {
  const context = useWizardVM();
  return <WizardVMContext.Provider value={context}>{children}</WizardVMContext.Provider>;
};

export const useWizardVMContext = () => React.useContext(WizardVMContext);
