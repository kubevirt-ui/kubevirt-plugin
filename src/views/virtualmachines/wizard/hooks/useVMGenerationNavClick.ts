import { useState } from 'react';

import { type WizardStepType } from '@patternfly/react-core';
import useCreateVMFromTemplate from '@virtualmachines/wizard/steps/TemplateStep/hooks/useCreateVMFromTemplate';
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
  const { createVMFromTemplate } = useCreateVMFromTemplate();
  const [isGeneratingVM, setIsGeneratingVM] = useState(false);

  const handleNavItemClick = async (
    step: WizardStepType,
    goToStepByIndex: (index: number) => void,
  ): Promise<void> => {
    if (VM_DRAFT_REQUIRED_STEPS.has(step?.id)) {
      setIsGeneratingVM(true);
      try {
        if (isInstanceTypeCreationMethod(creationMethod) && !ensureGeneratedVM()) {
          return;
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
  };

  return { handleNavItemClick, isGeneratingVM };
};

export default useVMGenerationNavClick;
