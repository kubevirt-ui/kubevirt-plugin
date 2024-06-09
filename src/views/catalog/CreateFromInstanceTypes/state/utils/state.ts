import { getOSImagesNS } from 'src/views/clusteroverview/OverviewTab/inventory-card/utils/utils';

import { initialSSHCredentials } from '@kubevirt-utils/components/SSHSecretModal/utils/constants';

import { InstanceTypeVMState, InstanceTypeVMStoreState } from './types';

export const instanceTypeVMInitialState: InstanceTypeVMState = {
  isDynamicSSHInjection: false,
  pvcSource: null,
  selectedBootableVolume: null,
  selectedInstanceType: { name: '', namespace: null },
  selectedStorageClass: null,
  sshSecretCredentials: initialSSHCredentials,
  sysprepConfigMapData: { data: {}, name: '', shouldCreateNewConfigMap: false },
  vmName: '',
  volumeSnapshotSource: null,
};

export const instanceTypeVMStoreInitialState: InstanceTypeVMStoreState = {
  instanceTypeVMState: instanceTypeVMInitialState,
  isChangingNamespace: true,
  startVM: true,
  vm: null,
  vmNamespaceTarget: '',
  volumeListNamespace: getOSImagesNS(),
};
