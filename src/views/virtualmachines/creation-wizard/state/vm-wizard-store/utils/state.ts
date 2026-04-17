import { VMWizardState } from '@virtualmachines/creation-wizard/state/vm-wizard-store/utils/types';
import { VMCreationMethod } from '@virtualmachines/creation-wizard/utils/constants';

export const initialVMWizardState: VMWizardState = {
  cloneVMDescription: '',
  cloneVMName: '',
  cluster: '',
  creationMethod: VMCreationMethod.INSTANCE_TYPE,
  folder: '',
  project: '',
  selectedTemplate: null,
  startVM: false,
  templatesDrawerIsOpen: false,
  vmNameConfirmed: false,
};
