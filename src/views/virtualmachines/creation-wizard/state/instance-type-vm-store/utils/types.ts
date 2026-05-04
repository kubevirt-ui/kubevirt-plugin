import { V1beta1DataVolume } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { VolumeSnapshotKind } from '@kubevirt-utils/components/SelectSnapshot/types';
import { BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import { OperatingSystemType } from '@virtualmachines/creation-wizard/steps/InstanceTypesSteps/GuestOSStep/utils/constants';

export type InstanceTypeVMState = {
  customDiskSize: string;
  dvSource: V1beta1DataVolume;
  operatingSystemType: OperatingSystemType;
  preference: string;
  pvcSource: IoK8sApiCoreV1PersistentVolumeClaim;
  selectedBootableVolume: BootableVolume;
  selectedInstanceType: { name: string; namespace: null | string };
  selectedSeries: string;
  selectedSize: string;
  useBootSource: boolean;
  volumeListNamespace: string;
  volumeSnapshotSource?: VolumeSnapshotKind;
};

export type InstanceTypeVMActions = {
  onSelectCreatedVolume: (
    selectedVolume: BootableVolume,
    pvcSource: IoK8sApiCoreV1PersistentVolumeClaim,
    volumeSnapshotSource: VolumeSnapshotKind,
    dvSource: V1beta1DataVolume,
  ) => void;
  resetInstanceTypeVMState: () => void;
  setDVSource: (dvSource: V1beta1DataVolume) => void;
  setOperatingSystemType: (osType: OperatingSystemType) => void;
  setPreference: (preference: string) => void;
  setPVCSource: (pvcSource: IoK8sApiCoreV1PersistentVolumeClaim) => void;
  setSelectedBootableVolume: (bootableVolume: BootableVolume) => void;
  setSelectedInstanceType: (instanceType: { name: string; namespace: null | string }) => void;
  setSelectedSeries: (series: string) => void;
  setSelectedSize: (size: string) => void;
  setUseBootSource: (useBootSource: boolean) => void;
  setVolumeListNamespace: (volumeListNamespace: string) => void;
  setVolumeSnapshotSource: (volumeSnapShotSource: VolumeSnapshotKind) => void;
};

export type InstanceTypeVMStore = InstanceTypeVMState & InstanceTypeVMActions;
