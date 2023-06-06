import produce from 'immer';
import { create } from 'zustand';

import { getInstanceTypeFromVolume } from '@kubevirt-utils/components/AddBootableVolumeModal/utils/utils';
import { getBootableVolumePVCSource } from '@kubevirt-utils/resources/bootableresources/helpers';
import { BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';

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
    onSelectCreatedVolume: (selectedVolume: BootableVolume) =>
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
