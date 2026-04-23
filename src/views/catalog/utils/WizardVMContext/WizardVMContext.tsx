import React, {
  createContext,
  Dispatch,
  FC,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from 'react';
import { Updater, useImmer } from 'use-immer';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';

import { getSessionStorageTabsData, getSessionStorageVM } from './utils/session';
import { TabsData } from './utils/tabs-data';
import { UpdateValidatedVM, useValidatedVM } from './useValidatedVm';
import { useWizardVMEffects } from './useWizardVMEffects';

export type WizardVMContextType = {
  /** is the virtual machine creation disabled */
  disableVmCreate?: boolean;
  /** error state of the vm context */
  error?: any;
  /** loaded state of the vm context */
  loaded?: boolean;
  /** Set the isCreatedDisabled variable */
  setDisableVmCreate?: Dispatch<SetStateAction<boolean>>;
  /** additional tabs data, not related to the vm */
  tabsData?: TabsData;
  /** update tabs data */
  updateTabsData?: Updater<TabsData>;
  /**
   * update the VirtualMachine used for the wizard
   * @param vm V1VirtualMachine
   */
  updateVM?: UpdateValidatedVM;
  /** the vm used for the wizard */
  vm?: V1VirtualMachine;
};

export const useWizardVM = (): WizardVMContextType => {
  const { error, loaded, updateVM, vm } = useValidatedVM(getSessionStorageVM());
  const [tabsData, updateTabsData] = useImmer<TabsData>(getSessionStorageTabsData());
  const [disableVmCreate, setDisableVmCreate] = useState(false);

  useWizardVMEffects(vm, tabsData);

  return {
    disableVmCreate,
    error,
    loaded,
    setDisableVmCreate,
    tabsData,
    updateTabsData,
    updateVM,
    vm,
  };
};

export const WizardVMContext = createContext<WizardVMContextType>({});

export const WizardVMContextProvider: FC<{ children?: ReactNode }> = ({ children }) => {
  const context = useWizardVM();
  return <WizardVMContext.Provider value={context}>{children}</WizardVMContext.Provider>;
};

export const useWizardVMContext = () => useContext(WizardVMContext);
