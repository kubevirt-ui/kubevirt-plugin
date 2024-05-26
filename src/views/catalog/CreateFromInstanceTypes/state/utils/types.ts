import { Dispatch } from 'react';

import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubernetes';
import {
  V1beta1VirtualMachineClusterInstancetype,
  V1beta1VirtualMachineClusterPreference,
  V1beta1VirtualMachineInstancetype,
  V1VirtualMachine,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { VolumeSnapshotKind } from '@kubevirt-utils/components/SelectSnapshot/types';
import { SSHSecretDetails } from '@kubevirt-utils/components/SSHSecretModal/utils/types';
import { SysprepData } from '@kubevirt-utils/components/SysprepModal/sysprep-utils';
import { BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';

export type InstanceTypes = (
  | V1beta1VirtualMachineClusterInstancetype
  | V1beta1VirtualMachineInstancetype
)[];

export type UseInstanceTypeAndPreferencesValues = {
  allInstanceTypes: InstanceTypes;
  clusterInstanceTypes: V1beta1VirtualMachineClusterInstancetype[];
  loaded: boolean;
  loadError: any;
  preferences: V1beta1VirtualMachineClusterPreference[];
};

export type UseBootableVolumesValues = {
  bootableVolumes: BootableVolume[];
  error: Error;
  loaded: boolean;
  pvcSources: {
    [resourceKeyName: string]: IoK8sApiCoreV1PersistentVolumeClaim;
  };
  volumeSnapshotSources: { [dataSourceName: string]: VolumeSnapshotKind };
};

export type SysprepConfigMapData = {
  data: SysprepData;
  name: string;
};

export type InstanceTypeVMState = {
  isDynamicSSHInjection: boolean;
  pvcSource: IoK8sApiCoreV1PersistentVolumeClaim;
  selectedBootableVolume: BootableVolume;
  selectedInstanceType: { name: string; namespace: string };
  selectedStorageClass: string;
  sshSecretCredentials: SSHSecretDetails;
  sysprepConfigMapData: SysprepConfigMapData;
  vmName: string;
  volumeSnapshotSource: VolumeSnapshotKind;
};

export enum instanceTypeActionType {
  setIsDynamicSSHInjection = 'isDynamicSSHInjection',
  setPVCSource = 'pvcSource',
  setSelectedBootableVolume = 'selectedBootableVolume',
  setSelectedInstanceType = 'selectedInstanceType',
  setSSHCredentials = 'sshSecretCredentials',
  setSysprepConfigMapData = 'sysprepConfigMapData',
  setVMName = 'vmName',
}

type InstanceTypeAction = {
  payload:
    | { name: string; namespace: string }
    | boolean
    | BootableVolume
    | SSHSecretDetails
    | string
    | SysprepConfigMapData;
  type: string;
};

export type InstanceTypeVMStoreState = {
  instanceTypeVMState: InstanceTypeVMState;
  isChangingNamespace: boolean;
  startVM: boolean;
  vm: V1VirtualMachine; // vm object for customization flow
  vmNamespaceTarget: string;
  volumeListNamespace: string;
};

type InstanceTypeVMStoreActions = {
  applySSHFromSettings: (sshSecretName: string, targetNamespace: string) => void;
  onSelectCreatedVolume: (
    selectedVolume: BootableVolume,
    pvcSource: IoK8sApiCoreV1PersistentVolumeClaim,
    volumeSnapshotSource: VolumeSnapshotKind,
  ) => void;
  resetInstanceTypeVMState: () => void;
  setInstanceTypeVMState: Dispatch<InstanceTypeAction>;
  setIsChangingNamespace: () => void;
  setSelectedStorageClass: (storageClass: string) => void;
  setStartVM: (checked: boolean) => void;
  setVM: (vm: V1VirtualMachine) => Promise<void>;
  setVMNamespaceTarget: (sshSecretName: string, targetNamespace: string) => void;
  setVolumeListNamespace: (namespace: string) => void;
};

export type InstanceTypeVMStore = InstanceTypeVMStoreState & InstanceTypeVMStoreActions;
