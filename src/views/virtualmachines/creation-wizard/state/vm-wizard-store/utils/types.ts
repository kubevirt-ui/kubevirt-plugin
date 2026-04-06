import { V1Template } from '@kubevirt-ui-ext/kubevirt-api/console';
import { VMCreationMethod } from '@virtualmachines/creation-wizard/utils/constants';

export type VMWizardState = {
  cloneVMDescription: string;
  cloneVMName: string;
  cluster: string;
  creationMethod: VMCreationMethod;
  folder: string;
  project: string;
  selectedTemplate: V1Template;
  startVM: boolean;
};

export type VMWizardActions = {
  resetWizardState: () => void;
  setCloneVMDescription: (cloneVMDescription: string) => void;
  setCloneVMName: (cloneVMName: string) => void;
  setCluster: (cluster: string) => void;
  setCreationMethod: (creationMethod: VMCreationMethod) => void;
  setFolder: (folder: string) => void;
  setProject: (project: string) => void;
  setSelectedTemplate: (template: V1Template) => void;
  setStartVM: (startVM: boolean) => void;
};

export type VMWizardStore = VMWizardState & VMWizardActions;
