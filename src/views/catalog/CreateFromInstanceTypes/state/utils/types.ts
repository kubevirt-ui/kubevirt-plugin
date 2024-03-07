import { Dispatch } from 'react';

import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubernetes';
import {
  V1beta1VirtualMachineClusterInstancetype,
  V1beta1VirtualMachineClusterPreference,
  V1beta1VirtualMachineInstancetype,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { VolumeSnapshotKind } from '@kubevirt-utils/components/SelectSnapshot/types';
import { SSHSecretDetails } from '@kubevirt-utils/components/SSHSecretModal/utils/types';
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

export type InstanceTypeVMState = {
  isDynamicSSHInjection: boolean;
  pvcSource: IoK8sApiCoreV1PersistentVolumeClaim;
  selectedBootableVolume: BootableVolume;
  selectedInstanceType: { name: string; namespace: string };
  selectedStorageClass: string;
  sshSecretCredentials: SSHSecretDetails;
  vmName: string;
};

export enum instanceTypeActionType {
  setIsDynamicSSHInjection = 'isDynamicSSHInjection',
  setPVCSource = 'pvcSource',
  setSelectedBootableVolume = 'selectedBootableVolume',
  setSelectedInstanceType = 'selectedInstanceType',
  setSSHCredentials = 'sshSecretCredentials',
  setVMName = 'vmName',
}

type InstanceTypeAction = {
  payload:
    | { name: string; namespace: string }
    | boolean
    | BootableVolume
    | SSHSecretDetails
    | string;
  type: string;
};

export type InstanceTypeVMStoreState = {
  instanceTypeVMState: InstanceTypeVMState;
  isChangingNamespace: boolean;
  vmNamespaceTarget: string;
};

type InstanceTypeVMStoreActions = {
  applySSHFromSettings: (sshSecretName: string, targetNamespace: string) => void;
  onSelectCreatedVolume: (
    selectedVolume: BootableVolume,
    pvcSource: IoK8sApiCoreV1PersistentVolumeClaim,
  ) => void;
  resetInstanceTypeVMState: () => void;
  setInstanceTypeVMState: Dispatch<InstanceTypeAction>;
  setIsChangingNamespace: () => void;
  setSelectedStorageClass: (storageClass: string) => void;
  setVMNamespaceTarget: (sshSecretName: string, targetNamespace: string) => void;
};

export type InstanceTypeVMStore = InstanceTypeVMStoreState & InstanceTypeVMStoreActions;
