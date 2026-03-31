import { V1beta1DataVolume } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { VolumeSnapshotKind } from '@kubevirt-utils/components/SelectSnapshot/types';
import { UploadDataProps } from '@kubevirt-utils/hooks/useCDIUpload/useCDIUpload';
import { BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import { OperatingSystemType } from '@virtualmachines/creation-wizard/steps/InstanceTypesSteps/GuestOSStep/utils/constants';
import { VMCreationMethod } from '@virtualmachines/creation-wizard/utils/constants';

export type UploadData = ({ dataVolume, file }: UploadDataProps) => Promise<void>;

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
  cluster: string;
  creationMethod: VMCreationMethod;
  folder: string;
  instanceTypeFlowState: InstanceTypeFlowState;
  project: string;
};

export type VMWizardActions = {
  onSelectCreatedVolume: (
    selectedVolume: BootableVolume,
    pvcSource?: IoK8sApiCoreV1PersistentVolumeClaim,
    volumeSnapshotSource?: VolumeSnapshotKind,
    dvSource?: V1beta1DataVolume,
  ) => void;
  resetWizardState: () => void;
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
};

export type VMWizardStore = VMWizardState & VMWizardActions;
