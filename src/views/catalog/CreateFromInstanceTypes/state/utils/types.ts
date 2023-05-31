import { Dispatch } from 'react';

import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubernetes';
import {
  V1alpha2VirtualMachineClusterInstancetype,
  V1alpha2VirtualMachineClusterPreference,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { SSHSecretDetails } from '@kubevirt-utils/components/SSHSecretSection/utils/types';
import { BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';

export type UseInstanceTypeAndPreferencesValues = {
  preferences: V1alpha2VirtualMachineClusterPreference[];
  instanceTypes: V1alpha2VirtualMachineClusterInstancetype[];
  loaded: boolean;
  loadError: any;
};

export type UseBootableVolumesValues = {
  bootableVolumes: BootableVolume[];
  loaded: boolean;
  loadError?: any;
  pvcSources: {
    [resourceKeyName: string]: IoK8sApiCoreV1PersistentVolumeClaim;
  };
};

export type InstanceTypeVMState = {
  selectedBootableVolume: BootableVolume;
  selectedInstanceType: string;
  vmName: string;
  sshSecretCredentials: SSHSecretDetails;
  pvcSource: IoK8sApiCoreV1PersistentVolumeClaim;
};

export enum instanceTypeActionType {
  setSelectedBootableVolume = 'selectedBootableVolume',
  setSelectedInstanceType = 'selectedInstanceType',
  setVMName = 'vmName',
  setSSHCredentials = 'sshSecretCredentials',
  setPVCSource = 'pvcSource',
}

type InstanceTypeAction = {
  type: string;
  payload: BootableVolume | string | SSHSecretDetails;
};

export type InstanceTypeVMStoreState = {
  instanceTypeVMState: InstanceTypeVMState;
  bootableVolumesData: UseBootableVolumesValues;
  instanceTypesAndPreferencesData: UseInstanceTypeAndPreferencesValues;
  activeNamespace: string;
  vmNamespaceTarget: string;
};

type InstanceTypeVMStoreActions = {
  setInstanceTypeVMState: Dispatch<InstanceTypeAction>;
  setBootableVolumesData: Dispatch<UseBootableVolumesValues>;
  setInstanceTypesAndPreferencesData: Dispatch<UseInstanceTypeAndPreferencesValues>;
  onSelectVolume: (selectedVolume: BootableVolume) => void;
  setActiveNamespace: Dispatch<string>;
  setVMNamespaceTarget: Dispatch<string>;
  resetInstanceTypeVMState: () => void;
};

export type InstanceTypeVMStore = InstanceTypeVMStoreState & InstanceTypeVMStoreActions;
