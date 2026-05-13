import { VMWizardState } from '@virtualmachines/creation-wizard/state/vm-wizard-store/utils/types';
import { VMCreationMethod, VMWizardStep } from '@virtualmachines/creation-wizard/utils/constants';

export const initialVMWizardState: VMWizardState = {
  cluster: '',
  creationMethod: VMCreationMethod.INSTANCE_TYPE,
  folder: '',
  lastProcessedTemplateKey: '',
  project: '',
  selectedTemplate: null,
  shouldCheckVMNameProperly: false,
  templatesDrawerIsOpen: false,
  visitedSteps: new Set([VMWizardStep.DEPLOYMENT_DETAILS]),
  vmDescription: '',
  vmName: undefined,
};
