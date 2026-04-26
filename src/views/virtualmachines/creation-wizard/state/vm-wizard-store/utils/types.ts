import { Template } from '@kubevirt-utils/resources/template';
import { VMCreationMethod } from '@virtualmachines/creation-wizard/utils/constants';

export type VMWizardState = {
  cloneVMDescription: string;
  cloneVMName: string;
  cluster: string;
  creationMethod: VMCreationMethod;
  folder: string;
  project: string;
  selectedTemplate: Template;
  templatesDrawerIsOpen: boolean;
  vmNameConfirmed: boolean;
};

export type VMWizardActions = {
  resetWizardState: () => void;
  setCloneVMDescription: (cloneVMDescription: string) => void;
  setCloneVMName: (cloneVMName: string) => void;
  setCluster: (cluster: string) => void;
  setCreationMethod: (creationMethod: VMCreationMethod) => void;
  setFolder: (folder: string) => void;
  setProject: (project: string) => void;
  setSelectedTemplate: (template: Template) => void;
  setTemplatesDrawerIsOpen: (templatesDrawerIsOpen: boolean) => void;
  setVMNameConfirmed: (vmNameConfirmed: boolean) => void;
};

export type VMWizardStore = VMWizardState & VMWizardActions;
