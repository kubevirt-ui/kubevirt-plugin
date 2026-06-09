import { Template } from '@kubevirt-utils/resources/template';
import { VMCreationMethod } from '@virtualmachines/creation-wizard/utils/constants';

export type VMWizardState = {
  cluster: string;
  creationMethod: VMCreationMethod;
  folder: string;
  lastProcessedTemplateKey: string;
  project: string;
  selectedTemplate: Template;
  shouldCheckVMNameProperly: boolean;
  templatesDrawerIsOpen: boolean;
  visitedSteps: Set<string>;
  vmDescription: string;
  vmName: string | undefined;
};

export type InitializeVMCreateWizardValues = Partial<VMWizardState> & {
  isAdmin: boolean;
  namespace: string;
};

export type VMWizardActions = {
  initializeVMCreationWizardValues: (values: InitializeVMCreateWizardValues) => void;
  markStepVisited: (stepId: string) => void;
  resetWizardState: () => void;
  setCluster: (cluster: string) => void;
  setCreationMethod: (creationMethod: VMCreationMethod) => void;
  setFolder: (folder: string) => void;
  setLastProcessedTemplateKey: (key: string) => void;
  setProject: (project: string) => void;
  setSelectedTemplate: (template: Template) => void;
  setShouldCheckVMNameProperly: (shouldCheckVMNameProperly: boolean) => void;
  setTemplatesDrawerIsOpen: (templatesDrawerIsOpen: boolean) => void;
  setVMDescription: (vmDescription: string) => void;
  setVMName: (vmName: string) => void;
};

export type VMWizardStore = VMWizardState & VMWizardActions;
