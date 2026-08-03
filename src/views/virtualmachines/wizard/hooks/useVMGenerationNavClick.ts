import { useState } from 'react';

import { setCustomizeWizardVMSignal } from '@kubevirt-utils/signals/customizeWizardVMSignal';
import { type WizardStepType } from '@patternfly/react-core';
import useCreateVMFromTemplate from '@virtualmachines/wizard/steps/TemplateStep/hooks/useCreateVMFromTemplate';
import {
  VM_GENERATION_STEPS,
  type VMCreationMethod,
} from '@virtualmachines/wizard/utils/constants';
import {
  isInstanceTypeCreationMethod,
  isTemplateCreationMethod,
} from '@virtualmachines/wizard/utils/utils';

import useGenerateVM from '../steps/InstanceTypesSteps/hooks/useGenerateVM/useGenerateVM';
import { type WizardStepNavItemConfig } from '../utils/types';

const useVMGenerationNavClick = (creationMethod: VMCreationMethod): WizardStepNavItemConfig => {
  const { generatedVM, loaded } = useGenerateVM();
  const { createVMFromTemplate } = useCreateVMFromTemplate();
  const [isGeneratingVM, setIsGeneratingVM] = useState(false);

  const handleNavItemClick = async (
    step: WizardStepType,
    activeStep: WizardStepType,
    goToStepByIndex: (index: number) => void,
  ): Promise<void> => {
    if (VM_GENERATION_STEPS.has(activeStep?.id)) {
      setIsGeneratingVM(true);
      try {
        if (isInstanceTypeCreationMethod(creationMethod)) {
          setCustomizeWizardVMSignal(generatedVM);
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

  return { handleNavItemClick, isGeneratingVM, loaded };
};

export default useVMGenerationNavClick;
