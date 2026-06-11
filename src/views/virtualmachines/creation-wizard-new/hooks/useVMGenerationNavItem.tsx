import React, { useCallback, useState } from 'react';

import { CustomWizardNavItemFunction, WizardNavItem, WizardStepType } from '@patternfly/react-core';
import useCreateVMFromInstanceType from '@virtualmachines/creation-wizard-new/steps/InstanceTypesSteps/hooks/useCreateVMFromInstanceType';
import useCreateVMFromTemplate from '@virtualmachines/creation-wizard-new/steps/TemplateStep/hooks/useCreateVMFromTemplate';
import {
  VM_GENERATION_STEPS,
  VMCreationMethod,
} from '@virtualmachines/creation-wizard-new/utils/constants';
import {
  isInstanceTypeCreationMethod,
  isTemplateCreationMethod,
} from '@virtualmachines/creation-wizard-new/utils/utils';

const useVMGenerationNavItem = (
  creationMethod: VMCreationMethod,
): { isGeneratingVM: boolean; navItemWithVMGeneration: CustomWizardNavItemFunction } => {
  const createVMFromInstanceType = useCreateVMFromInstanceType();
  const { createVMFromTemplate } = useCreateVMFromTemplate();
  const [isGeneratingVM, setIsGeneratingVM] = useState(false);

  const isInstanceTypeMethod = isInstanceTypeCreationMethod(creationMethod);
  const isTemplateMethod = isTemplateCreationMethod(creationMethod);

  const navItemWithVMGeneration: CustomWizardNavItemFunction = useCallback(
    (
      step: WizardStepType,
      activeStep: WizardStepType,
      _steps: WizardStepType[],
      goToStepByIndex: (index: number) => void,
    ) => (
      <WizardNavItem
        onClick={async () => {
          if (VM_GENERATION_STEPS.has(activeStep?.id)) {
            setIsGeneratingVM(true);
            try {
              if (isInstanceTypeMethod) await createVMFromInstanceType();
              if (isTemplateMethod) await createVMFromTemplate();
            } finally {
              setIsGeneratingVM(false);
            }
          }
          goToStepByIndex(step.index);
        }}
        content={step.name}
        id={step.id}
        isCurrent={step.id === activeStep?.id}
        isDisabled={step.isDisabled || isGeneratingVM}
        stepIndex={step.index}
      />
    ),
    [
      createVMFromInstanceType,
      createVMFromTemplate,
      isGeneratingVM,
      isInstanceTypeMethod,
      isTemplateMethod,
    ],
  );

  return { isGeneratingVM, navItemWithVMGeneration };
};

export default useVMGenerationNavItem;
