import produce from 'immer';
import { create } from 'zustand';

import { V1beta1DataVolume } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { getInstanceTypeFromVolume } from '@kubevirt-utils/components/AddBootableVolumeModal/utils/utils';
import { VolumeSnapshotKind } from '@kubevirt-utils/components/SelectSnapshot/types';
import { BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import { initialInstanceTypeVMState } from '@virtualmachines/creation-wizard/state/instance-type-vm-store/utils/state';
import { InstanceTypeVMStore } from '@virtualmachines/creation-wizard/state/instance-type-vm-store/utils/types';
import { OperatingSystemType } from '@virtualmachines/creation-wizard/steps/InstanceTypesSteps/GuestOSStep/utils/constants';
import { getDiskSize } from '@virtualmachines/creation-wizard/utils/utils';

const useInstanceTypeVMStore = create<InstanceTypeVMStore>()((set) => {
  return {
    ...initialInstanceTypeVMState,
    onSelectCreatedVolume: (
      selectedVolume: BootableVolume,
      pvcSource: IoK8sApiCoreV1PersistentVolumeClaim,
      volumeSnapshotSource: VolumeSnapshotKind,
      dvSource: V1beta1DataVolume,
    ) =>
      set(
        produce<InstanceTypeVMStore>((draftState) => {
          const instanceTypeName = getInstanceTypeFromVolume(selectedVolume);
          const [series = '', size = ''] = instanceTypeName?.split('.') || [];

          draftState.dvSource = dvSource;
          draftState.selectedBootableVolume = selectedVolume;
          draftState.pvcSource = pvcSource;
          draftState.volumeSnapshotSource = volumeSnapshotSource;
          draftState.customDiskSize = getDiskSize(dvSource, pvcSource, volumeSnapshotSource);
          draftState.selectedInstanceType = {
            name: instanceTypeName,
            namespace: null,
          };
          draftState.selectedSeries = series;
          draftState.selectedSize = size;
        }),
      ),
    setDVSource: (dvSource: V1beta1DataVolume) =>
      set({
        dvSource,
      }),
    setOperatingSystemType: (osType: OperatingSystemType) =>
      set((state) => ({
        ...state,
        operatingSystemType: osType,
        preference: '',
      })),
    setPreference: (preference: string) =>
      set({
        preference,
      }),
    setPVCSource: (pvcSource: IoK8sApiCoreV1PersistentVolumeClaim) =>
      set({
        pvcSource,
      }),
    setSelectedBootableVolume: (selectedBootableVolume: BootableVolume) =>
      set({ selectedBootableVolume }),
    setSelectedInstanceType: (selectedInstanceType: { name: string; namespace: string }) =>
      set({ selectedInstanceType }),
    setSelectedSeries: (selectedSeries: string) =>
      set((state) => ({
        ...state,
        selectedInstanceType: {
          name: selectedSeries,
          namespace: null,
        },
        selectedSeries: selectedSeries,
        selectedSize: '',
      })),
    setSelectedSize: (selectedSize: string) =>
      set((state) => ({
        ...state,
        selectedInstanceType: {
          name: state?.selectedSeries ? `${state.selectedSeries}.${selectedSize}` : selectedSize,
          namespace: null,
        },
        selectedSize: selectedSize,
      })),
    setUseBootSource: (useBootSource: boolean) => set({ useBootSource }),
    setVolumeListNamespace: (volumeListNamespace: string) => set({ volumeListNamespace }),
    setVolumeSnapshotSource: (volumeSnapshotSource: VolumeSnapshotKind) =>
      set({ volumeSnapshotSource }),
  };
});

export default useInstanceTypeVMStore;
