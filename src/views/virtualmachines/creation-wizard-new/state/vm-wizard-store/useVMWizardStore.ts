import { create } from 'zustand';

import { Template } from '@kubevirt-utils/resources/template';
import { clearCustomizeInstanceType } from '@kubevirt-utils/store/customizeInstanceType';
import useInstanceTypeVMStore from '@virtualmachines/creation-wizard-new/state/instance-type-vm-store/useInstanceTypeVMStore';
import { initialVMWizardState } from '@virtualmachines/creation-wizard-new/state/vm-wizard-store/utils/state';
import {
  InitializeVMCreateWizardValues,
  VMWizardStore,
} from '@virtualmachines/creation-wizard-new/state/vm-wizard-store/utils/types';
import {
  VMCreationMethod,
  VMWizardStep,
} from '@virtualmachines/creation-wizard-new/utils/constants';

const clearWizardRelatedStores = (): void => {
  clearCustomizeInstanceType();
  useInstanceTypeVMStore.getState().resetInstanceTypeVMState();
};

const useVMWizardStore = create<VMWizardStore>()((set) => {
  return {
    ...initialVMWizardState,
    initializeVMCreationWizardValues: ({
      cluster,
      isAdmin,
      namespace,
    }: InitializeVMCreateWizardValues) => {
      clearWizardRelatedStores();
      set(({ project: previousProject }) => ({
        ...initialVMWizardState,
        cluster,
        // Non-admin: always use the active namespace.
        // Admin: keep their previously selected project if set, otherwise use the active namespace.
        project: !isAdmin ? namespace : previousProject || namespace,
      }));
    },
    markStepVisited: (stepId: string) =>
      set((state) => {
        if (state.visitedSteps.has(stepId)) return state;
        const next = new Set(state.visitedSteps);
        next.add(stepId);
        return { visitedSteps: next };
      }),
    resetWizardState: () => {
      clearWizardRelatedStores();
      set({ ...initialVMWizardState, visitedSteps: new Set([VMWizardStep.DEPLOYMENT_DETAILS]) });
    },
    setCluster: (cluster: string) => set({ cluster }),
    setCreationMethod: (creationMethod: VMCreationMethod) => set({ creationMethod }),
    setFolder: (folder: string) => set({ folder }),
    setLastProcessedTemplateKey: (lastProcessedTemplateKey: string) =>
      set({ lastProcessedTemplateKey }),
    setProject: (project: string) => set({ project }),
    setSelectedTemplate: (selectedTemplate: Template) => set(() => ({ selectedTemplate })),
    setShouldCheckVMNameProperly: (shouldCheckVMNameProperly: boolean) =>
      set({ shouldCheckVMNameProperly }),
    setTemplatesDrawerIsOpen: (templatesDrawerIsOpen: boolean) =>
      set(() => ({ templatesDrawerIsOpen })),
    setVMDescription: (vmDescription: string) => set({ vmDescription }),
    setVMName: (vmName: string) => set({ vmName }),
  };
});

export default useVMWizardStore;
