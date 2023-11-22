import React from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';

import { setSessionStorageTabsData, setSessionStorageVM } from './utils/session';
import { TabsData } from './utils/tabs-data';

export const useWizardVMEffects = (vm: V1VirtualMachine, tabsData: TabsData) => {
  // session storage effects
  React.useEffect(() => {
    // whenever the vm changes, save the vm in session storage
    if (vm) {
      setSessionStorageVM(vm);
    }
  }, [vm]);

  React.useEffect(() => {
    // whenever the tabs data changes, save the data in session storage
    if (tabsData) {
      setSessionStorageTabsData(tabsData);
    }
  }, [tabsData]);
};
