import { Template } from '@kubevirt-utils/resources/template';
import { VMCreationMethod } from '@virtualmachines/creation-wizard/utils/constants';

export type VMWizardState = {
  cloneVMDescription: string;
  cloneVMName: string;
  cluster: string;
  creationMethod: VMCreationMethod;
  folder: string;
  isVMNameValid: boolean;
  project: string;
  selectedTemplate: Template;
  startVM: boolean;
  templatesDrawerIsOpen: boolean;
  vmNameInteracted: boolean;
};

export type VMWizardActions = {
  resetWizardState: () => void;
  setCloneVMDescription: (cloneVMDescription: string) => void;
  setCloneVMName: (cloneVMName: string) => void;
  setCluster: (cluster: string) => void;
  setCreationMethod: (creationMethod: VMCreationMethod) => void;
  setFolder: (folder: string) => void;
  setIsVMNameValid: (isVMNameValid: boolean) => void;
  setProject: (project: string) => void;
  setSelectedTemplate: (template: Template) => void;
  setStartVM: (startVM: boolean) => void;
  setTemplatesDrawerIsOpen: (templatesDrawerIsOpen: boolean) => void;
  setVMNameInteracted: (vmNameInteracted: boolean) => void;
};

export type VMWizardStore = VMWizardState & VMWizardActions;
