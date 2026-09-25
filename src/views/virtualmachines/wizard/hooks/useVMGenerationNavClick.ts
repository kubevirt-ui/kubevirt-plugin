import { useCallback, useRef, useState } from 'react';

import { type WizardStepType } from '@patternfly/react-core';
import {
  getNavigationPrerequisites,
  getWizardStepIds,
} from '@virtualmachines/wizard/form/stepValidation';
import { useVMWizardForm } from '@virtualmachines/wizard/form/VMWizardFormProvider';
import useWizardStepValidation from '@virtualmachines/wizard/hooks/useWizardStepValidation';
import { useVMWizardState } from '@virtualmachines/wizard/state/useVMWizardState';
import useCreateVMFromTemplate from '@virtualmachines/wizard/steps/TemplateStep/hooks/useCreateVMFromTemplate';
import {
  VM_DRAFT_REQUIRED_STEPS,
  VM_GENERATION_STEPS,
  type VMCreationMethod,
  type VMWizardStep,
} from '@virtualmachines/wizard/utils/constants';
import {
  isInstanceTypeCreationMethod,
  isTemplateCreationMethod,
} from '@virtualmachines/wizard/utils/utils';

import useGenerateVM from '../steps/InstanceTypesSteps/hooks/useGenerateVM/useGenerateVM';
import { type WizardStepNavItemConfig } from '../utils/types';

const useVMGenerationNavClick = (creationMethod: VMCreationMethod): WizardStepNavItemConfig => {
  const { getFieldState, setValue } = useVMWizardForm();
  const { currentStep, setStrictVMName, visitedSteps } = useVMWizardState();
  const { isStepDisabled, validateSteps } = useWizardStepValidation();
  const { generatedVM, loaded } = useGenerateVM();
  const { createVMFromTemplate } = useCreateVMFromTemplate();
  const [isGeneratingVM, setIsGeneratingVM] = useState(false);
  const navigatingRef = useRef(false);

  const handleNavItemClick = async (
    step: WizardStepType,
    activeStep: WizardStepType,
    goToStepByIndex: (index: number) => void,
  ): Promise<void> => {
    // Block overlapping transitions while validation or VM generation is in progress.
    if (navigatingRef.current || isGeneratingVM) return;

    const target = step.id as VMWizardStep;
    const current = activeStep.id as VMWizardStep;
    const flow = getWizardStepIds(creationMethod);

    // Returning to an earlier step does not require validation or VM generation.
    if (flow.indexOf(target) <= flow.indexOf(current)) {
      goToStepByIndex(step.index);
      return;
    }

    navigatingRef.current = true;

    try {
      // Forward navigation requires every preceding step to have been visited.
      const prerequisites = getNavigationPrerequisites(creationMethod, current, target);

      if (prerequisites.some((prerequisite) => !visitedSteps.has(prerequisite))) return;

      // Validate only prerequisites so fields in later steps cannot block this transition.
      if (!(await validateSteps(prerequisites))) {
        // Reveal strict name feedback when the navigation attempt rejects the name.
        if (getFieldState('deployment.name').invalid) {
          setStrictVMName(true);
        }

        return;
      }
      // Keep the existing generation flow, but run it only after validation succeeds.
      if (VM_GENERATION_STEPS.has(activeStep?.id)) {
        setIsGeneratingVM(true);
        try {
          if (isInstanceTypeCreationMethod(creationMethod) && generatedVM) {
            // Refresh validation feedback for consumers of the newly generated draft.
            setValue('customization.vmDraft', generatedVM, { shouldValidate: true });
          }

          if (isTemplateCreationMethod(creationMethod)) {
            const success = await createVMFromTemplate();

            if (!success) return;
          }
        } finally {
          setIsGeneratingVM(false);
        }
      }
      goToStepByIndex(step.index);
    } finally {
      navigatingRef.current = false;
    }
  };

  // Shared function for footer buttons and nav items
  const isNavigationStepDisabled = useCallback(
    (step: VMWizardStep): boolean => {
      const current = currentStep as VMWizardStep;
      const flow = getWizardStepIds(creationMethod);

      if (isGeneratingVM) return true;

      // Validation errors do not prevent returning to an earlier step.
      if (flow.indexOf(step) <= flow.indexOf(current)) return false;

      // Generation readiness only blocks forward steps that need a VM draft.
      return (
        isStepDisabled(step) ||
        (VM_DRAFT_REQUIRED_STEPS.has(step) &&
          isInstanceTypeCreationMethod(creationMethod) &&
          !loaded)
      );
    },
    [creationMethod, currentStep, isGeneratingVM, isStepDisabled, loaded],
  );

  return {
    handleNavItemClick,
    isGeneratingVM,
    isStepDisabled: isNavigationStepDisabled,
  };
};

export default useVMGenerationNavClick;
