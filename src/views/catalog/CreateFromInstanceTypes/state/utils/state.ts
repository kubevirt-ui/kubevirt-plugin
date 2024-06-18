import { getOSImagesNS } from 'src/views/clusteroverview/OverviewTab/inventory-card/utils/utils';

import {
  initialSSHCredentials,
  initialSysprepData,
} from '@kubevirt-utils/components/SSHSecretModal/utils/constants';

import { InstanceTypeVMState, InstanceTypeVMStoreState } from './types';

export const instanceTypeVMInitialState: InstanceTypeVMState = {
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
  startVM: true,
  vm: null,
  vmNamespaceTarget: '',
  volumeListNamespace: getOSImagesNS(),
};
