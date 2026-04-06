import { create } from 'zustand';

import { initialVMWizardState } from '@virtualmachines/creation-wizard/state/vm-wizard-store/utils/state';
import { VMWizardStore } from '@virtualmachines/creation-wizard/state/vm-wizard-store/utils/types';
import { VMCreationMethod } from '@virtualmachines/creation-wizard/utils/constants';

const useVMWizardStore = create<VMWizardStore>()((set) => {
  return {
    ...initialVMWizardState,
    resetWizardState: () => set({ ...initialVMWizardState }),
    setCloneVMDescription: (cloneVMDescription: string) => set({ cloneVMDescription }),
    setCloneVMName: (cloneVMName: string) => set({ cloneVMName }),
    setCluster: (cluster: string) => set({ cluster }),
    setCreationMethod: (creationMethod: VMCreationMethod) => set({ creationMethod }),
    setFolder: (folder: string) => set({ folder }),
    setProject: (project: string) => set({ project }),
    setSelectedTemplate: (selectedTemplate: V1Template) => set(() => ({ selectedTemplate })),
    setStartVM: (startVM: boolean) => set({ startVM }),
  };
});

export default useVMWizardStore;
