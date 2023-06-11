import { initialSSHCredentials } from '@kubevirt-utils/components/SSHSecretSection/utils/constants';

import {
  InstanceTypeVMState,
  InstanceTypeVMStoreState,
  UseBootableVolumesValues,
  UseInstanceTypeAndPreferencesValues,
} from './types';
import { getRandomVMName } from './utils';

const instanceTypeVMInitialState: InstanceTypeVMState = {
  pvcSource: null,
  selectedBootableVolume: null,
  selectedInstanceType: '',
  sshSecretCredentials: initialSSHCredentials,
  vmName: getRandomVMName(),
};

export const instanceTypeVMStoreInitialState: InstanceTypeVMStoreState = {
  activeNamespace: '',
  bootableVolumesData: {} as UseBootableVolumesValues,
  instanceTypesAndPreferencesData: {} as UseInstanceTypeAndPreferencesValues,
  instanceTypeVMState: instanceTypeVMInitialState,
  vmNamespaceTarget: '',
};
