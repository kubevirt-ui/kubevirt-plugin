import { V1Template } from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1beta1DataVolume } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { VolumeSnapshotKind } from '@kubevirt-utils/components/SelectSnapshot/types';
import { BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import { OperatingSystemType } from '@virtualmachines/creation-wizard/steps/InstanceTypesSteps/GuestOSStep/utils/constants';
import { VMCreationMethod } from '@virtualmachines/creation-wizard/utils/constants';

export type InstanceTypeFlowState = {
  customDiskSize: string;
  dvSource: V1beta1DataVolume;
  operatingSystemType: OperatingSystemType;
  preference: string;
  pvcSource: IoK8sApiCoreV1PersistentVolumeClaim;
  selectedBootableVolume: BootableVolume;
  selectedInstanceType: { name: string; namespace: string };
  selectedSeries: string;
  selectedSize: string;
  volumeListNamespace: string;
  volumeSnapshotSource?: VolumeSnapshotKind;
};

export type VMWizardState = {
  cloneVMDescription: string;
  cloneVMName: string;
  cluster: string;
  creationMethod: VMCreationMethod;
  folder: string;
  instanceTypeFlowState: InstanceTypeFlowState;
  project: string;
  selectedTemplate: V1Template;
  startVM: boolean;
};

export type VMWizardActions = {
  onSelectCreatedVolume: (
    selectedVolume: BootableVolume,
    pvcSource?: IoK8sApiCoreV1PersistentVolumeClaim,
    volumeSnapshotSource?: VolumeSnapshotKind,
    dvSource?: V1beta1DataVolume,
  ) => void;
  resetWizardState: () => void;
  setCloneVMDescription: (cloneVMDescription: string) => void;
  setCloneVMName: (cloneVMName: string) => void;
  setCluster: (cluster: string) => void;
  setCreationMethod: (creationMethod: VMCreationMethod) => void;
  setDvSource: (dvSource: V1beta1DataVolume) => void;
  setFolder: (folder: string) => void;
  setInstanceTypeFlowState: (updates: Partial<InstanceTypeFlowState>) => void;
  setOperatingSystemType: (osType: OperatingSystemType) => void;
  setPreference: (preference: string) => void;
  setProject: (project: string) => void;
  setPVCSource: (pvcSource: IoK8sApiCoreV1PersistentVolumeClaim) => void;
  setSelectedBootableVolume: (bootableVolume: BootableVolume) => void;
  setSelectedInstanceType: (instanceType: { name: string; namespace: string }) => void;
  setSelectedSeries: (series: string) => void;
  setSelectedSize: (size: string) => void;
  setSelectedTemplate: (template: V1Template) => void;
  setStartVM: (startVM: boolean) => void;
  setVolumeListNamespace: (volumeListNamespace: string) => void;
};

export type VMWizardStore = VMWizardState & VMWizardActions;
