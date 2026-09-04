import { useState } from 'react';

import { type WizardStepType } from '@patternfly/react-core';
import { useTemplateVMGeneration } from '@virtualmachines/wizard/state/template-vm-generation-context/TemplateVMGenerationProvider';
import {
  VM_DRAFT_REQUIRED_STEPS,
  type VMCreationMethod,
} from '@virtualmachines/wizard/utils/constants';
import {
  isInstanceTypeCreationMethod,
  isTemplateCreationMethod,
} from '@virtualmachines/wizard/utils/utils';

import { type EnsureGeneratedVM, type WizardStepNavItemConfig } from '../utils/types';

const useVMGenerationNavClick = (
  creationMethod: VMCreationMethod,
  ensureGeneratedVM: EnsureGeneratedVM,
): WizardStepNavItemConfig => {
  const { createVMFromTemplate, isProcessing: isTemplateGenerationInProgress } =
    useTemplateVMGeneration();
  const [isNavigationGenerationInProgress, setIsNavigationGenerationInProgress] = useState(false);

  const handleNavItemClick = async (
    step: WizardStepType,
    goToStepByIndex: (index: number) => void,
  ): Promise<void> => {
    if (VM_DRAFT_REQUIRED_STEPS.has(step?.id)) {
      setIsNavigationGenerationInProgress(true);
      try {
        if (isInstanceTypeCreationMethod(creationMethod) && !ensureGeneratedVM()) {
          return;
        }

        if (isTemplateCreationMethod(creationMethod)) {
          const success = await createVMFromTemplate();
          if (!success) return;
        }
      } finally {
        setIsNavigationGenerationInProgress(false);
      }
    }
    goToStepByIndex(step.index);
  };

  const isGeneratingVM =
    isNavigationGenerationInProgress ||
    (isTemplateCreationMethod(creationMethod) && isTemplateGenerationInProgress);

  return { handleNavItemClick, isGeneratingVM };
};

export default useVMGenerationNavClick;
