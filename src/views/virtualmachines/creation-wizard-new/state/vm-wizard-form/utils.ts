import {
  VMCreationMethod,
  VMWizardStep,
} from '@virtualmachines/creation-wizard-new/utils/constants';

import { CreateInitialVMWizardFormValuesArgs, VMWizardFormValues } from './types';

export const createInitialVMWizardFormValues = ({
  cluster,
  namespace,
}: CreateInitialVMWizardFormValuesArgs): VMWizardFormValues => ({
  stepNavigation: {
    visitedSteps: new Set([VMWizardStep.DEPLOYMENT_DETAILS]),
  },
  uiState: {
    isTemplatesDrawerOpen: false,
    lastProcessedTemplateKey: '',
    shouldCheckVMNameProperly: false,
  },
  vmData: {
    cluster,
    creationMethod: VMCreationMethod.INSTANCE_TYPE,
    description: '',
    folder: '',
    name: undefined,
    project: namespace,
    selectedTemplate: null,
  },
});
