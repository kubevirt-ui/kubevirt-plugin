import { VMWizardFormValues } from '@virtualmachines/creation-wizard-new/state/vm-wizard-form/types';
import {
  VMCreationMethod,
  VMWizardStep,
} from '@virtualmachines/creation-wizard-new/utils/constants';

export type CreateInitialVMWizardFormValuesArgs = {
  cluster: string;
  namespace: string;
};

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
