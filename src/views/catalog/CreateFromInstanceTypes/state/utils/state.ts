import { adjectives, animals, uniqueNamesGenerator } from 'unique-names-generator';

import { initialInstanceTypeState } from '../../utils/constants';

import {
  InstanceTypeVMState,
  InstanceTypeVMStoreState,
  UseBootableVolumesValues,
  UseInstanceTypeAndPreferencesValues,
} from './types';

const instanceTypeVMInitialState: InstanceTypeVMState = {
  selectedBootableVolume: null,
  selectedInstanceType: initialInstanceTypeState,
  vmName: uniqueNamesGenerator({
    dictionaries: [adjectives, animals],
    separator: '-',
  }),
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
