import { VMWizardState } from '@virtualmachines/creation-wizard/state/vm-wizard-store/utils/types';
import { VMCreationMethod, VMWizardStep } from '@virtualmachines/creation-wizard/utils/constants';

export const initialVMWizardState: VMWizardState = {
  cloneVMDescription: '',
  cloneVMName: '',
  cluster: '',
  creationMethod: VMCreationMethod.INSTANCE_TYPE,
  folder: '',
  isVMNameValid: false,
  project: '',
  selectedTemplate: null,
  templatesDrawerIsOpen: false,
  visitedSteps: new Set([VMWizardStep.DEPLOYMENT_DETAILS]),
  vmNameInteracted: false,
};
