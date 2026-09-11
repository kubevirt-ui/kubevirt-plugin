import React, { type FC } from 'react';

import { setCustomizeWizardVMSignal } from '@kubevirt-utils/signals/customizeWizardVMSignal';
import { useWizardContext, WizardFooter } from '@patternfly/react-core';
import {
  WIZARD_BACK_BUTTON_PROPS,
  WIZARD_CANCEL_BUTTON_PROPS,
  WIZARD_NEXT_BUTTON_PROPS,
} from '@virtualmachines/wizard/components/constants';
import useCloseWizard from '@virtualmachines/wizard/hooks/useCloseWizard';
import useWizardStepValidation from '@virtualmachines/wizard/hooks/useWizardStepValidation';
import { VMWizardStep } from '@virtualmachines/wizard/utils/constants';

import useGenerateVM from '../../hooks/useGenerateVM/useGenerateVM';

const ComputeResourcesStepFooter: FC = () => {
  const { activeStep, goToNextStep, goToPrevStep } = useWizardContext();
  const { generatedVM, loaded } = useGenerateVM();
  const closeWizard = useCloseWizard();
  const { isNextDisabledForStep } = useWizardStepValidation();

  const handleGoToNextStep = (): void => {
    setCustomizeWizardVMSignal(generatedVM);
    void goToNextStep();
  };

  return (
    <WizardFooter
      activeStep={activeStep}
      backButtonProps={WIZARD_BACK_BUTTON_PROPS}
      cancelButtonProps={WIZARD_CANCEL_BUTTON_PROPS}
      isBackDisabled={activeStep.index === 1}
      isNextDisabled={isNextDisabledForStep(VMWizardStep.COMPUTE_RESOURCES) || !loaded}
      nextButtonProps={{ ...WIZARD_NEXT_BUTTON_PROPS, isLoading: !loaded }}
      onBack={goToPrevStep}
      onClose={closeWizard}
      onNext={handleGoToNextStep}
    />
  );
};

export default ComputeResourcesStepFooter;
