import { initialInstanceTypeState } from '../../utils/constants';

import {
  InstanceTypeVMState,
  InstanceTypeVMStoreState,
  UseBootableVolumesValues,
  UseInstanceTypeAndPreferencesValues,
} from './types';
import { getRandomVMName } from './utils';

const instanceTypeVMInitialState: InstanceTypeVMState = {
  selectedBootableVolume: null,
  selectedInstanceType: initialInstanceTypeState,
  vmName: getRandomVMName(),
  sshSecretCredentials: {
    sshSecretName: '',
    sshSecretKey: '',
  },
  pvcSource: null,
};

export const instanceTypeVMStoreInitialState: InstanceTypeVMStoreState = {
  instanceTypeVMState: instanceTypeVMInitialState,
  bootableVolumesData: {} as UseBootableVolumesValues,
  instanceTypesAndPreferencesData: {} as UseInstanceTypeAndPreferencesValues,
  activeNamespace: '',
  vmNamespaceTarget: '',
};
