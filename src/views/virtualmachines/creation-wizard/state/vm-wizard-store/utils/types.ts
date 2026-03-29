import { OperatingSystemType } from '@virtualmachines/creation-wizard/steps/InstanceTypesSteps/GuestOSStep/utils/constants';
import { VMCreationMethod } from '@virtualmachines/creation-wizard/utils/constants';

export type VMWizardState = {
  cluster: string;
  creationMethod: VMCreationMethod;
  folder: string;
  operatingSystemType: OperatingSystemType;
  preference: string;
  project: string;
};

export type VMWizardActions = {
  resetWizardState: () => void;
  setCluster: (cluster: string) => void;
  setCreationMethod: (creationMethod: VMCreationMethod) => void;
  setFolder: (folder: string) => void;
  setOperatingSystemType: (osType: OperatingSystemType) => void;
  setPreference: (preference: string) => void;
  setProject: (project: string) => void;
};

export type VMWizardStore = VMWizardState & VMWizardActions;
