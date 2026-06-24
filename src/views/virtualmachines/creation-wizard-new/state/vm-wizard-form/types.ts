import { Template } from '@kubevirt-utils/resources/template';
import { VMCreationMethod } from '@virtualmachines/creation-wizard-new/utils/constants';

/** VM identity, placement, and provisioning choices collected across wizard steps. */
export type VMWizardVirtualMachineData = {
  cluster: string;
  creationMethod: VMCreationMethod;
  description: string;
  folder: string;
  name: string | undefined;
  project: string;
  selectedTemplate: null | Template;
};

/** Ephemeral UI state that does not belong on the VM resource. */
export type VMWizardUIState = {
  isTemplatesDrawerOpen: boolean;
  lastProcessedTemplateKey: string;
  shouldCheckVMNameProperly: boolean;
};

/** Wizard flow position and per-step next-button availability. */
export type VMWizardStepNavigation = {
  visitedSteps: Set<string>;
};

export type VMWizardFormValues = {
  stepNavigation: VMWizardStepNavigation;
  uiState: VMWizardUIState;
  vmData: VMWizardVirtualMachineData;
};

export type CreateInitialVMWizardFormValuesArgs = {
  cluster: string;
  namespace: string;
};
