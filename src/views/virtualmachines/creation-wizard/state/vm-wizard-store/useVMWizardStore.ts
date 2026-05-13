import { create } from 'zustand';

import { Template } from '@kubevirt-utils/resources/template';
import { clearCustomizeInstanceType } from '@kubevirt-utils/store/customizeInstanceType';
import useInstanceTypeVMStore from '@virtualmachines/creation-wizard/state/instance-type-vm-store/useInstanceTypeVMStore';
import { initialVMWizardState } from '@virtualmachines/creation-wizard/state/vm-wizard-store/utils/state';
import { VMWizardStore } from '@virtualmachines/creation-wizard/state/vm-wizard-store/utils/types';
import { VMCreationMethod, VMWizardStep } from '@virtualmachines/creation-wizard/utils/constants';

const useVMWizardStore = create<VMWizardStore>()((set) => {
  return {
    ...initialVMWizardState,
    markStepVisited: (stepId: string) =>
      set((state) => {
        if (state.visitedSteps.has(stepId)) return state;
        const next = new Set(state.visitedSteps);
        next.add(stepId);
        return { visitedSteps: next };
      }),
    resetWizardState: () => {
      clearCustomizeInstanceType();
      useInstanceTypeVMStore.getState().resetInstanceTypeVMState();
      set({ ...initialVMWizardState, visitedSteps: new Set([VMWizardStep.DEPLOYMENT_DETAILS]) });
    },
    setCloneVMDescription: (cloneVMDescription: string) => set({ cloneVMDescription }),
    setCloneVMName: (cloneVMName: string) => set({ cloneVMName }),
    setCluster: (cluster: string) => set({ cluster }),
    setCreationMethod: (creationMethod: VMCreationMethod) => set({ creationMethod }),
    setFolder: (folder: string) => set({ folder }),
    setIsVMNameValid: (isVMNameValid: boolean) => set({ isVMNameValid }),
    setProject: (project: string) => set({ project }),
    setSelectedTemplate: (selectedTemplate: Template) => set(() => ({ selectedTemplate })),
    setTemplatesDrawerIsOpen: (templatesDrawerIsOpen: boolean) =>
      set(() => ({ templatesDrawerIsOpen })),
    setVMNameInteracted: (vmNameInteracted: boolean) => set({ vmNameInteracted }),
  };
});

export default useVMWizardStore;
