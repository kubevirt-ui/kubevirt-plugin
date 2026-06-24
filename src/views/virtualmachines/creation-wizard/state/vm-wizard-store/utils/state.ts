import { VMWizardState } from '@virtualmachines/creation-wizard/state/vm-wizard-store/utils/types';
import { VMCreationMethod } from '@virtualmachines/creation-wizard/utils/constants';

export const initialVMWizardState: VMWizardState = {
  cluster: '',
  creationMethod: VMCreationMethod.INSTANCE_TYPE,
  folder: '',
  lastProcessedTemplateKey: '',
  project: '',
  selectedTemplate: null,
  shouldCheckVMNameProperly: false,
  templatesDrawerIsOpen: false,
  vmDescription: '',
  vmName: undefined,
};
