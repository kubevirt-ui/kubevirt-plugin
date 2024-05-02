import { initialSSHCredentials } from '@kubevirt-utils/components/SSHSecretModal/utils/constants';

import { InstanceTypeVMState, InstanceTypeVMStoreState } from './types';

const instanceTypeVMInitialState: InstanceTypeVMState = {
  isDynamicSSHInjection: false,
  pvcSource: null,
  selectedBootableVolume: null,
  selectedInstanceType: { name: '', namespace: null },
  selectedStorageClass: null,
  sshSecretCredentials: initialSSHCredentials,
  vmName: '',
  volumeSnapshotSource: null,
};

export const instanceTypeVMStoreInitialState: InstanceTypeVMStoreState = {
  instanceTypeVMState: instanceTypeVMInitialState,
  isChangingNamespace: true,
  startVM: true,
  vm: null,
  vmNamespaceTarget: '',
};
