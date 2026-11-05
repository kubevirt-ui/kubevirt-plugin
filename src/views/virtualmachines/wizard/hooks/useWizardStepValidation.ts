import { useCallback } from 'react';
import { useWatch } from 'react-hook-form';

import {
  getNavigationPrerequisites,
  mapWizardErrorsToSteps,
  triggerWizardStepsValidation,
} from '@virtualmachines/wizard/form/stepValidation';
import { useVMWizardForm } from '@virtualmachines/wizard/form/VMWizardFormProvider';
import { useVMWizardState } from '@virtualmachines/wizard/state/useVMWizardState';
import { type VMWizardStep } from '@virtualmachines/wizard/utils/constants';

type WizardStepValidation = {
  isStepDisabled: (stepId: VMWizardStep) => boolean;
  validateSteps: (steps: readonly VMWizardStep[]) => Promise<boolean>;
};

// Derives navigation gates directly from the current RHF errors and active flow
const useWizardStepValidation = (): WizardStepValidation => {
  const { control, formState, getValues, trigger } = useVMWizardForm();
  const { currentStep, visitedSteps } = useVMWizardState();
  const creationMethod = useWatch({ control, name: 'creationMethod' });

  const errorsByStep = mapWizardErrorsToSteps(formState.errors, creationMethod);

  const isStepDisabled = useCallback(
    (stepId: VMWizardStep): boolean => {
      return getNavigationPrerequisites(creationMethod, currentStep as VMWizardStep, stepId).some(
        (step) => errorsByStep[step] || !visitedSteps.has(step),
      );
    },
    [creationMethod, currentStep, errorsByStep, visitedSteps],
  );

  const validateSteps = useCallback(
    (steps: readonly VMWizardStep[]) =>
      triggerWizardStepsValidation(trigger, getValues('creationMethod'), steps),
    [getValues, trigger],
  );

  return { isStepDisabled, validateSteps };
};

export default useWizardStepValidation;
