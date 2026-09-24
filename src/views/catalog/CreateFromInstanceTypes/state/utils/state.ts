import {
  initialSSHCredentials,
  initialSysprepData,
} from '@kubevirt-utils/components/SSHSecretModal/utils/constants';
import { ALL_PROJECTS } from '@kubevirt-utils/hooks/constants';
import { getDefaultRunningStrategy } from '@kubevirt-utils/resources/vm/utils/constants';

import { InstanceTypeVMState, InstanceTypeVMStoreState } from './types';

export const instanceTypeVMInitialState: InstanceTypeVMState = {
  customDiskSize: '',
  dvSource: null,
  folder: '',
  isDynamicSSHInjection: false,
  pvcSource: null,
  selectedBootableVolume: null,
  selectedInstanceType: { name: '', namespace: null },
  selectedStorageClass: null,
  sshSecretCredentials: initialSSHCredentials,
  sysprepConfigMapData: initialSysprepData,
  vmName: '',
  volumeSnapshotSource: null,
};

export const instanceTypeVMStoreInitialState: InstanceTypeVMStoreState = {
  instanceTypeVMState: instanceTypeVMInitialState,
  isChangingNamespace: true,
  runStrategy: getDefaultRunningStrategy(),
  vm: null,
  vmNamespaceTarget: '',
  volumeListNamespace: ALL_PROJECTS,
};
