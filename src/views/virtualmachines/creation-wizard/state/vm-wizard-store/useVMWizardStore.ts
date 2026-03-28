import produce from 'immer';
import { create } from 'zustand';

import { V1beta1DataVolume } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { getInstanceTypeFromVolume } from '@kubevirt-utils/components/AddBootableVolumeModal/utils/utils';
import { VolumeSnapshotKind } from '@kubevirt-utils/components/SelectSnapshot/types';
import { BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import { initialVMWizardState } from '@virtualmachines/creation-wizard/state/vm-wizard-store/utils/state';
import {
  InstanceTypeFlowState,
  VMWizardStore,
} from '@virtualmachines/creation-wizard/state/vm-wizard-store/utils/types';
import { OperatingSystemType } from '@virtualmachines/creation-wizard/steps/InstanceTypesSteps/GuestOSStep/utils/constants';
import { VMCreationMethod } from '@virtualmachines/creation-wizard/utils/constants';
import { getDiskSize } from '@virtualmachines/creation-wizard/utils/utils';

const useVMWizardStore = create<VMWizardStore>()((set) => {
  return {
    ...initialVMWizardState,
    onSelectCreatedVolume: (
      selectedVolume: BootableVolume,
      pvcSource: IoK8sApiCoreV1PersistentVolumeClaim,
      volumeSnapshotSource: VolumeSnapshotKind,
      dvSource: V1beta1DataVolume,
    ) =>
      set(
        produce<VMWizardStore>(({ instanceTypeFlowState }) => {
          const instanceTypeName = getInstanceTypeFromVolume(selectedVolume);
          const [series = '', size = ''] = instanceTypeName?.split('.') || [];

          instanceTypeFlowState.dvSource = dvSource;
          instanceTypeFlowState.selectedBootableVolume = selectedVolume;
          instanceTypeFlowState.pvcSource = pvcSource;
          instanceTypeFlowState.volumeSnapshotSource = volumeSnapshotSource;
          instanceTypeFlowState.customDiskSize = getDiskSize(
            dvSource,
            pvcSource,
            volumeSnapshotSource,
          );
          instanceTypeFlowState.selectedInstanceType = {
            name: instanceTypeName,
            namespace: null,
          };
          instanceTypeFlowState.selectedSeries = series;
          instanceTypeFlowState.selectedSize = size;
        }),
      ),
    resetWizardState: () => set({ ...initialVMWizardState }),
    setCluster: (cluster: string) => set({ cluster }),
    setCreationMethod: (creationMethod: VMCreationMethod) => set({ creationMethod }),
    setDvSource: (dvSource: V1beta1DataVolume) =>
      set((state) => ({
        instanceTypeFlowState: { ...state.instanceTypeFlowState, dvSource },
      })),
    setFolder: (folder: string) => set({ folder }),
    setInstanceTypeFlowState: (updates: Partial<InstanceTypeFlowState>) =>
      set((state) => ({
        instanceTypeFlowState: { ...state.instanceTypeFlowState, ...updates },
      })),
    setOperatingSystemType: (osType: OperatingSystemType) =>
      set((state) => ({
        instanceTypeFlowState: {
          ...state.instanceTypeFlowState,
          operatingSystemType: osType,
          preference: '',
        },
      })),
    setPreference: (preference: string) =>
      set((state) => ({
        instanceTypeFlowState: { ...state.instanceTypeFlowState, preference },
      })),
    setProject: (project: string) => set({ project }),
    setPVCSource: (pvcSource: IoK8sApiCoreV1PersistentVolumeClaim) =>
      set((state) => ({
        instanceTypeFlowState: { ...state.instanceTypeFlowState, pvcSource },
      })),
    setSelectedBootableVolume: (bootableVolume: BootableVolume) =>
      set((state) => ({
        instanceTypeFlowState: {
          ...state.instanceTypeFlowState,
          selectedBootableVolume: bootableVolume,
        },
      })),
    setSelectedInstanceType: (instanceType: { name: string; namespace: string }) =>
      set((state) => ({
        instanceTypeFlowState: {
          ...state.instanceTypeFlowState,
          selectedInstanceType: instanceType,
        },
      })),
    setSelectedSeries: (series: string) =>
      set((state) => ({
        instanceTypeFlowState: {
          ...state.instanceTypeFlowState,
          selectedInstanceType: {
            name: series,
            namespace: null,
          },
          selectedSeries: series,
          selectedSize: '',
        },
      })),
    setSelectedSize: (size: string) =>
      set((state) => ({
        instanceTypeFlowState: {
          ...state.instanceTypeFlowState,
          selectedInstanceType: {
            name: state.instanceTypeFlowState.selectedSeries
              ? `${state.instanceTypeFlowState.selectedSeries}.${size}`
              : size,
            namespace: null,
          },
          selectedSize: size,
        },
      })),
    setVolumeListNamespace: (volumeListNamespace: string) =>
      set((state) => ({
        instanceTypeFlowState: { ...state.instanceTypeFlowState, volumeListNamespace },
      })),
  };
});

export default useVMWizardStore;
