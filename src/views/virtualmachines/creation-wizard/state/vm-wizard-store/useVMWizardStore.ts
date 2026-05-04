import { create } from 'zustand';

import { Template } from '@kubevirt-utils/resources/template';
import { clearCustomizeInstanceType } from '@kubevirt-utils/store/customizeInstanceType';
import useInstanceTypeVMStore from '@virtualmachines/creation-wizard/state/instance-type-vm-store/useInstanceTypeVMStore';
import { initialVMWizardState } from '@virtualmachines/creation-wizard/state/vm-wizard-store/utils/state';
import { VMWizardStore } from '@virtualmachines/creation-wizard/state/vm-wizard-store/utils/types';
import { VMCreationMethod } from '@virtualmachines/creation-wizard/utils/constants';

const useVMWizardStore = create<VMWizardStore>()((set) => {
  return {
    ...initialVMWizardState,
    resetWizardState: () => {
      clearCustomizeInstanceType();
      useInstanceTypeVMStore.getState().resetInstanceTypeVMState();
      set({ ...initialVMWizardState });
    },
    setCloneVMDescription: (cloneVMDescription: string) => set({ cloneVMDescription }),
    setCloneVMName: (cloneVMName: string) => set({ cloneVMName }),
    setCluster: (cluster: string) => set({ cluster }),
    setCreationMethod: (creationMethod: VMCreationMethod) => set({ creationMethod }),
    setFolder: (folder: string) => set({ folder }),
    setProject: (project: string) => set({ project }),
    setSelectedTemplate: (selectedTemplate: Template) => set(() => ({ selectedTemplate })),
    setTemplatesDrawerIsOpen: (templatesDrawerIsOpen: boolean) =>
      set(() => ({ templatesDrawerIsOpen })),
    setVMNameConfirmed: (vmNameConfirmed: boolean) => set({ vmNameConfirmed }),
  };
});

export default useVMWizardStore;
