import { initialSSHCredentials } from '@kubevirt-utils/components/SSHSecretSection/utils/constants';

import {
  InstanceTypeVMState,
  InstanceTypeVMStoreState,
  UseBootableVolumesValues,
  UseInstanceTypeAndPreferencesValues,
} from './types';
import { getRandomVMName } from './utils';

const instanceTypeVMInitialState: InstanceTypeVMState = {
  selectedBootableVolume: null,
  selectedInstanceType: '',
  vmName: getRandomVMName(),
  sshSecretCredentials: initialSSHCredentials,
  pvcSource: null,
};

export const instanceTypeVMStoreInitialState: InstanceTypeVMStoreState = {
  instanceTypeVMState: instanceTypeVMInitialState,
  bootableVolumesData: {} as UseBootableVolumesValues,
  instanceTypesAndPreferencesData: {} as UseInstanceTypeAndPreferencesValues,
  activeNamespace: '',
  vmNamespaceTarget: '',
};
