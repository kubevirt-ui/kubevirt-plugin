import produce from 'immer';
import { create } from 'zustand';

import { getInstanceTypeFromVolume } from '@kubevirt-utils/components/AddBootableVolumeModal/utils/utils';
import { DEFAULT_PREFERENCE_LABEL } from '@kubevirt-utils/resources/bootableresources/constants';
import { getBootableVolumePVCSource } from '@kubevirt-utils/resources/bootableresources/helpers';
import { BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import { getLabel } from '@kubevirt-utils/resources/shared';

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
    onSelectCreatedVolume: (selectedVolume: BootableVolume) =>
      set(
        produce<InstanceTypeVMStore>(({ instanceTypeVMState }) => {
          instanceTypeVMState.selectedBootableVolume = selectedVolume;
          instanceTypeVMState.pvcSource = getBootableVolumePVCSource(
            selectedVolume,
            get().bootableVolumesData.pvcSources,
          );
          instanceTypeVMState.selectedInstanceType = getInstanceTypeFromVolume(selectedVolume);

          const osName = getLabel(selectedVolume, DEFAULT_PREFERENCE_LABEL).replace('.', '');
          instanceTypeVMState.vmName = getRandomVMName(osName);
        }),
      ),
    resetInstanceTypeVMState: () => set(instanceTypeVMStoreInitialState),
    setActiveNamespace: (namespace: string) => set({ activeNamespace: namespace }),
    setBootableVolumesData: (data: UseBootableVolumesValues) => set({ bootableVolumesData: data }),
    setInstanceTypesAndPreferencesData: (data: UseInstanceTypeAndPreferencesValues) =>
      set({ instanceTypesAndPreferencesData: data }),
    setInstanceTypeVMState: ({ payload, type }) =>
      set(
        produce<InstanceTypeVMStore>(({ instanceTypeVMState }) => {
          instanceTypeVMState[type] = payload;
        }),
      ),
    setVMNamespaceTarget: (namespace: string) => set({ vmNamespaceTarget: namespace }),
  };
});
