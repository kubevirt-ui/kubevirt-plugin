import produce from 'immer';
import { create } from 'zustand';

import { V1beta1DataVolume } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import {
  AddBootableVolumeState,
  DROPDOWN_FORM_SELECTION,
} from '@kubevirt-utils/components/AddBootableVolumeModal/utils/constants';
import { getInstanceTypeFromVolume } from '@kubevirt-utils/components/AddBootableVolumeModal/utils/utils';
import { VolumeSnapshotKind } from '@kubevirt-utils/components/SelectSnapshot/types';
import { DataUpload } from '@kubevirt-utils/hooks/useCDIUpload/useCDIUpload';
import { BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import { initialVMWizardState } from '@virtualmachines/creation-wizard/state/vm-wizard-store/utils/state';
import {
  InstanceTypeFlowState,
  UploadData,
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
            name: getInstanceTypeFromVolume(selectedVolume),
            namespace: null,
          };
        }),
      ),
    resetWizardState: () => set({ ...initialVMWizardState }),
    setBootableVolume: (bootableVolume: AddBootableVolumeState) =>
      set((state) => ({ addBootSourceState: { ...state.addBootSourceState, bootableVolume } })),
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
    setSourceType: (sourceType: DROPDOWN_FORM_SELECTION) =>
      set((state) => ({ addBootSourceState: { ...state.addBootSourceState, sourceType } })),
    setUpload: (upload: DataUpload) =>
      set((state) => ({ addBootSourceState: { ...state.addBootSourceState, upload } })),
    setUploadData: (uploadData: UploadData) =>
      set((state) => ({ addBootSourceState: { ...state.addBootSourceState, uploadData } })),
    setVolumeListNamespace: (volumeListNamespace: string) =>
      set((state) => ({
        instanceTypeFlowState: { ...state.instanceTypeFlowState, volumeListNamespace },
      })),
  };
});

export default useVMWizardStore;
