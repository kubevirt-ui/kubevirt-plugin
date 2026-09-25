import { useCallback } from 'react';
import { useWatch } from 'react-hook-form';

import { vmNameInputSchema } from '@virtualmachines/wizard/form/schema/deployment/createDeploymentSchema';
import {
  getNavigationPrerequisites,
  mapWizardErrorsToSteps,
  triggerWizardStepsValidation,
} from '@virtualmachines/wizard/form/stepValidation';
import { useVMWizardForm } from '@virtualmachines/wizard/form/VMWizardFormProvider';
import { useVMWizardState } from '@virtualmachines/wizard/state/useVMWizardState';
import { VMWizardStep } from '@virtualmachines/wizard/utils/constants';

type WizardStepValidation = {
  isStepDisabled: (stepId: VMWizardStep) => boolean;
  validateSteps: (steps: readonly VMWizardStep[]) => Promise<boolean>;
};

// Derives navigation gates directly from the current RHF errors and active flow
const useWizardStepValidation = (): WizardStepValidation => {
  const { control, formState, getValues, trigger } = useVMWizardForm();
  const { currentStep, strictVMName, visitedSteps } = useVMWizardState();
  const [creationMethod, vmName] = useWatch({
    control,
    name: ['creationMethod', 'deployment.name'],
  });

  const errorsByStep = mapWizardErrorsToSteps(formState.errors, creationMethod);

  const isStepValid = useCallback(
    (stepId: VMWizardStep): boolean => {
      if (
        stepId === VMWizardStep.DEPLOYMENT_DETAILS &&
        currentStep === stepId &&
        !strictVMName &&
        errorsByStep[stepId]
      ) {
        return vmNameInputSchema.isValidSync(vmName);
      }

      return !errorsByStep[stepId];
    },
    [currentStep, errorsByStep, strictVMName, vmName],
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
