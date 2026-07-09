import { getAnnotation } from '@kubevirt-utils/resources/shared';
import { DESCRIPTION_ANNOTATION, getFolder } from '@kubevirt-utils/resources/vm';
import {
  patchCustomizeWizardVMSignal,
  vmSignal,
} from '@kubevirt-utils/store/customizeInstanceType';
import type { WizardStepType } from '@patternfly/react-core';
import { VM_FOLDER_LABEL } from '@virtualmachines/tree/utils/constants';
import { useVMWizard } from '@virtualmachines/wizard/state/vm-wizard-context/VMWizardContext';
import { CREATE_VM_FORM_FIELDS_VM_DATA } from '@virtualmachines/wizard/state/vm-wizard-form/consts';
import { VMWizardStep } from '@virtualmachines/wizard/utils/constants';

type UseSyncDeploymentDetails = () => (
  currentStep: WizardStepType,
  prevStep: WizardStepType,
) => void;

/**
 * Keeps the form's Deployment Details buffers in sync with vmSignal's annotation
 * across step transitions. Flushes the form value to the signal when leaving Deployment Details,
 * and hydrates the form from the signal when entering Deployment Details.
 */
export const useSyncDeploymentDetails: UseSyncDeploymentDetails = () => {
  const { getValues, setValue } = useVMWizard();

  return (currentStep: WizardStepType, prevStep: WizardStepType) => {
    if (!vmSignal.value) {
      return;
    }

    if (prevStep?.id === VMWizardStep.DEPLOYMENT_DETAILS) {
      const description = getValues(CREATE_VM_FORM_FIELDS_VM_DATA.DESCRIPTION);
      const folder = getValues(CREATE_VM_FORM_FIELDS_VM_DATA.FOLDER);
      patchCustomizeWizardVMSignal([
        {
          data: description || undefined,
          path: `metadata.annotations.${DESCRIPTION_ANNOTATION}`,
        },
        {
          data: folder || undefined,
          path: ['metadata', 'labels', VM_FOLDER_LABEL],
        },
      ]);
    }

    if (currentStep?.id === VMWizardStep.DEPLOYMENT_DETAILS) {
      setValue(
        CREATE_VM_FORM_FIELDS_VM_DATA.DESCRIPTION,
        getAnnotation(vmSignal.value, DESCRIPTION_ANNOTATION, ''),
      );
      setValue(CREATE_VM_FORM_FIELDS_VM_DATA.FOLDER, getFolder(vmSignal.value) || '');
    }
  };
};
