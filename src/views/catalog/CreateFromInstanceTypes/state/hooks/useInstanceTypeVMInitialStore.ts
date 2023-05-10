import produce from 'immer';
import { create } from 'zustand';

import { getInstanceTypeFromVolume } from '@catalog/CreateFromInstanceTypes/components/AddBootableVolumeModal/utils/utils';
import { BootableVolume } from '@catalog/CreateFromInstanceTypes/utils/types';
import { getBootableVolumePVCSource } from '@catalog/CreateFromInstanceTypes/utils/utils';

import { instanceTypeVMStoreInitialState } from '../utils/state';
import {
  InstanceTypeVMStore,
  UseBootableVolumesValues,
  UseInstanceTypeAndPreferencesValues,
} from '../utils/types';
import { getRandomVMName } from '../utils/utils';

export const useInstanceTypeVMInitialStore = create<InstanceTypeVMStore>()((set, get) => {
  return {
    ...instanceTypeVMStoreInitialState,
    setInstanceTypeVMState: ({ type, payload }) =>
      set(
        produce<InstanceTypeVMStore>(({ instanceTypeVMState }) => {
          instanceTypeVMState[type] = payload;
        }),
      ),
    setBootableVolumesData: (data: UseBootableVolumesValues) => set({ bootableVolumesData: data }),
    setInstanceTypesAndPreferencesData: (data: UseInstanceTypeAndPreferencesValues) =>
      set({ instanceTypesAndPreferencesData: data }),
    onSelectVolume: (selectedVolume: BootableVolume) =>
      set(
        produce<InstanceTypeVMStore>(({ instanceTypeVMState }) => {
          instanceTypeVMState.selectedBootableVolume = selectedVolume;
          instanceTypeVMState.pvcSource = getBootableVolumePVCSource(
            selectedVolume,
            get().bootableVolumesData.pvcSources,
          );
          instanceTypeVMState.selectedInstanceType = getInstanceTypeFromVolume(selectedVolume);
        }),
      ),
    setActiveNamespace: (namespace: string) => set({ activeNamespace: namespace }),
    setVMNamespaceTarget: (namespace: string) => set({ vmNamespaceTarget: namespace }),
    resetInstanceTypeVMState: () =>
      set({
        ...instanceTypeVMStoreInitialState,
        instanceTypeVMState: {
          ...instanceTypeVMStoreInitialState.instanceTypeVMState,
          vmName: getRandomVMName(),
        },
      }),
  };
});
