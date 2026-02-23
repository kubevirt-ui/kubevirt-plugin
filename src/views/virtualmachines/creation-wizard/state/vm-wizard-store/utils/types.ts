import { VMCreationMethod } from '@virtualmachines/creation-wizard/utils/constants';

export type VMWizardState = {
  cluster: string;
  creationMethod: VMCreationMethod;
  folder: string;
  project: string;
};

export type VMWizardActions = {
  resetWizardState: () => void;
  setCluster: (cluster: string) => void;
  setCreationMethod: (creationMethod: VMCreationMethod) => void;
  setFolder: (folder: string) => void;
  setProject: (project: string) => void;
};

export type VMWizardStore = VMWizardState & VMWizardActions;
