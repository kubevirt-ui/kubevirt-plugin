import { create } from 'zustand';

import { initialVMWizardState } from '@virtualmachines/creation-wizard/state/vm-wizard-store/utils/state';
import { VMWizardStore } from '@virtualmachines/creation-wizard/state/vm-wizard-store/utils/types';
import { OperatingSystemType } from '@virtualmachines/creation-wizard/steps/InstanceTypesSteps/GuestOSStep/utils/constants';
import { VMCreationMethod } from '@virtualmachines/creation-wizard/utils/constants';

const useVMWizardStore = create<VMWizardStore>()((set) => {
  return {
    ...initialVMWizardState,
    resetWizardState: () => set({ ...initialVMWizardState }),
    setCluster: (cluster: string) => set({ cluster }),
    setCreationMethod: (creationMethod: VMCreationMethod) => set({ creationMethod }),
    setFolder: (folder: string) => set({ folder }),
    setOperatingSystemType: (osType: OperatingSystemType) =>
      set({ operatingSystemType: osType, preference: '' }),
    setPreference: (preference: string) => set({ preference }),
    setProject: (project: string) => set({ project }),
  };
});

export default useVMWizardStore;
