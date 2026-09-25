import { useRef } from 'react';

import { type WizardStepType } from '@patternfly/react-core';
import {
  getNavigationPrerequisites,
  getWizardStepIds,
} from '@virtualmachines/wizard/form/stepValidation';
import { useVMWizardForm } from '@virtualmachines/wizard/form/VMWizardFormProvider';
import { type VMGenerationCoordinator } from '@virtualmachines/wizard/hooks/useVMGenerationCoordinator/types';
import useWizardStepValidation from '@virtualmachines/wizard/hooks/useWizardStepValidation';
import { useVMWizardState } from '@virtualmachines/wizard/state/useVMWizardState';
import {
  VM_DRAFT_REQUIRED_STEPS,
  type VMCreationMethod,
  type VMWizardStep,
} from '@virtualmachines/wizard/utils/constants';
import {
  isInstanceTypeCreationMethod,
  isTemplateCreationMethod,
} from '@virtualmachines/wizard/utils/utils';

import { type WizardStepNavItemConfig } from '../utils/types';

const useVMGenerationNavClick = (
  creationMethod: VMCreationMethod,
  generationCoordinator: VMGenerationCoordinator,
): WizardStepNavItemConfig => {
  const { getFieldState } = useVMWizardForm();
  const { currentStep, setStrictVMName, visitedSteps } = useVMWizardState();
  const { isStepDisabled, validateSteps } = useWizardStepValidation();
  const { ensureInstanceTypeDraft, ensureTemplateDraft, instanceTypeReady, isTemplateGenerating } =
    generationCoordinator;
  const navigatingRef = useRef(false);

  const generateVMForMethod = async (): Promise<boolean> => {
    if (isInstanceTypeCreationMethod(creationMethod)) return ensureInstanceTypeDraft();
    if (isTemplateCreationMethod(creationMethod)) return ensureTemplateDraft();

    return true;
  };

  const handleNavItemClick = async (
    step: WizardStepType,
    activeStep: WizardStepType,
    goToStepByIndex: (index: number) => void,
  ): Promise<void> => {
    // Block navigation while validating or VM generation is in progress
    if (navigatingRef.current || isTemplateGenerating) return;

    const target = step.id as VMWizardStep;
    const current = activeStep.id as VMWizardStep;
    const flow = getWizardStepIds(creationMethod);

    // Returning to an earlier step does not require validation or VM generation
    if (flow.indexOf(target) <= flow.indexOf(current)) {
      goToStepByIndex(step.index);
      return;
    }

    navigatingRef.current = true;

    try {
      // Forward navigation requires every preceding step to have been visited.
      const prerequisites = getNavigationPrerequisites(creationMethod, current, target);
      if (prerequisites.some((prerequisite) => !visitedSteps.has(prerequisite))) return;

      // Validate only prerequisites so fields in later steps cannot block this transition
      if (!(await validateSteps(prerequisites))) {
        if (getFieldState('deployment.name').invalid) {
          setStrictVMName(true);
        }

        return;
      }

      // After validation succeeds, ensure a draft exists for steps that require one
      // The coordinator reuses an unchanged source or publishes a reconciled draft with validation
      if (VM_DRAFT_REQUIRED_STEPS.has(target) && !(await generateVMForMethod())) return;

      goToStepByIndex(step.index);
    } finally {
      navigatingRef.current = false;
    }
  };

  return {
    handleNavItemClick,
    isGeneratingVM: isTemplateGenerating,
    // Shared destination checks for footer buttons and nav items
    isStepDisabled: (step): boolean => {
      const current = currentStep as VMWizardStep;
      const flow = getWizardStepIds(creationMethod);

      if (isTemplateGenerating) return true;
      // Validation errors do not prevent returning to an earlier step
      if (flow.indexOf(step) <= flow.indexOf(current)) return false;

      // Generation readiness only blocks forward steps that need a VM draft
      return (
        isStepDisabled(step) ||
        (VM_DRAFT_REQUIRED_STEPS.has(step) &&
          isInstanceTypeCreationMethod(creationMethod) &&
          !instanceTypeReady)
      );
    },
  };
};

export default useVMGenerationNavClick;
