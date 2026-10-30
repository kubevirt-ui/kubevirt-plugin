import { useCallback } from 'react';
import { useWatch } from 'react-hook-form';

import {
  getNavigationPrerequisites,
  hasWizardStepErrors,
  mapWizardErrorsToSteps,
  triggerWizardStepsValidation,
} from '@virtualmachines/wizard/form/stepValidation';
import { useVMWizardForm } from '@virtualmachines/wizard/form/VMWizardFormProvider';
import useVmNameValidation from '@virtualmachines/wizard/hooks/useVmNameValidation';
import { useVMWizardState } from '@virtualmachines/wizard/state/useVMWizardState';
import { VMWizardStep } from '@virtualmachines/wizard/utils/constants';

type WizardStepValidation = {
  isStepDisabled: (stepId: VMWizardStep) => boolean;
  validateSteps: (steps: readonly VMWizardStep[]) => Promise<boolean>;
};

// Derives navigation gates directly from the current RHF errors and active flow
const useWizardStepValidation = (): WizardStepValidation => {
  const { control, formState, getValues, trigger } = useVMWizardForm();
  const { currentStep, visitedSteps } = useVMWizardState();
  const creationMethod = useWatch({ control, name: 'creationMethod' });
  const { isVmNameValid } = useVmNameValidation();

  const errorsByStep = mapWizardErrorsToSteps(formState.errors, creationMethod);

  const isStepValid = useCallback(
    (stepId: VMWizardStep): boolean => {
      const useSharedNameValidation =
        stepId === VMWizardStep.DEPLOYMENT_DETAILS && currentStep === stepId;

      if (!useSharedNameValidation) {
        return !errorsByStep[stepId];
      }

      if (hasWizardStepErrors(formState.errors, stepId, creationMethod, ['deployment.name'])) {
        return false;
      }

      return isVmNameValid;
    },
    [creationMethod, currentStep, errorsByStep, formState.errors, isVmNameValid],
  );

  const isStepDisabled = useCallback(
    (stepId: VMWizardStep): boolean => {
      return getNavigationPrerequisites(creationMethod, currentStep as VMWizardStep, stepId).some(
        (step) => !isStepValid(step) || !visitedSteps.has(step),
      );
    },
    [creationMethod, currentStep, isStepValid, visitedSteps],
  );

  const validateSteps = useCallback(
    (steps: readonly VMWizardStep[]) =>
      triggerWizardStepsValidation(trigger, getValues('creationMethod'), steps),
    [getValues, trigger],
  );

  return { isStepDisabled, validateSteps };
};

export default useWizardStepValidation;
