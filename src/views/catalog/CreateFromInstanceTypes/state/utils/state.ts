import { initialSSHCredentials } from '@kubevirt-utils/components/SSHSecretSection/utils/constants';

import { InstanceTypeVMState, InstanceTypeVMStoreState } from './types';

const instanceTypeVMInitialState: InstanceTypeVMState = {
  isDynamicSSHInjection: false,
  pvcSource: null,
  selectedBootableVolume: null,
  selectedInstanceType: '',
  sshSecretCredentials: initialSSHCredentials,
  vmName: '',
};

export const instanceTypeVMStoreInitialState: InstanceTypeVMStoreState = {
  instanceTypeVMState: instanceTypeVMInitialState,
  isChangingNamespace: true,
  vmNamespaceTarget: '',
};
