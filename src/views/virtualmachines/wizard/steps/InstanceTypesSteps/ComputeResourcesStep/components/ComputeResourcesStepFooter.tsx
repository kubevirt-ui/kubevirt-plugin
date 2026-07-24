import React, { type FC } from 'react';

import { setCustomizeWizardVMSignal } from '@kubevirt-utils/signals/customizeWizardVMSignal';
import { type ButtonProps, useWizardContext, WizardFooter } from '@patternfly/react-core';
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
      backButtonProps={{ 'data-test': 'wizard-back-button' } as Omit<ButtonProps, 'children'>}
      cancelButtonProps={{ 'data-test': 'wizard-cancel-button' } as Omit<ButtonProps, 'children'>}
      isBackDisabled={activeStep.index === 1}
      isNextDisabled={isNextDisabledForStep(VMWizardStep.COMPUTE_RESOURCES) || !loaded}
      nextButtonProps={
        { 'data-test': 'wizard-next-button', isLoading: !loaded } as Omit<ButtonProps, 'children'>
      }
      onBack={goToPrevStep}
      onClose={closeWizard}
      onNext={handleGoToNextStep}
    />
  );
};

export default ComputeResourcesStepFooter;
