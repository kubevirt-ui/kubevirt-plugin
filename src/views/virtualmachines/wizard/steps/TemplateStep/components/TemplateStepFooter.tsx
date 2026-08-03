import React, { FC } from 'react';

import { type ButtonProps, useWizardContext, WizardFooter } from '@patternfly/react-core';
import useCloseWizard from '@virtualmachines/wizard/hooks/useCloseWizard';
import useWizardStepValidation from '@virtualmachines/wizard/hooks/useWizardStepValidation';
import { useVMWizard } from '@virtualmachines/wizard/state/vm-wizard-context/VMWizardContext';
import { CREATE_VM_FORM_FIELDS_UI_STATE } from '@virtualmachines/wizard/state/vm-wizard-form/consts';
import useCreateVMFromTemplate from '@virtualmachines/wizard/steps/TemplateStep/hooks/useCreateVMFromTemplate';
import { VMWizardStep } from '@virtualmachines/wizard/utils/constants';

const TemplateStepFooter: FC = () => {
  const { activeStep, goToNextStep, goToPrevStep } = useWizardContext();
  const { createVMFromTemplate, isProcessing } = useCreateVMFromTemplate();
  const closeWizard = useCloseWizard();
  const { setValue } = useVMWizard();
  const { isNextDisabledForStep } = useWizardStepValidation();

  const handleGoToNextStep = async (): Promise<void> => {
    const success = await createVMFromTemplate();
    if (!success) return;

    setValue(CREATE_VM_FORM_FIELDS_UI_STATE.IS_TEMPLATES_DRAWER_OPEN, false);
    goToNextStep();
  };

  return (
    <WizardFooter
      activeStep={activeStep}
      backButtonProps={{ 'data-test': 'wizard-back-button' } as Omit<ButtonProps, 'children'>}
      cancelButtonProps={
        {
          'data-test': 'wizard-cancel-button',
          isDisabled: isProcessing,
        } as Omit<ButtonProps, 'children'>
      }
      isBackDisabled={activeStep.index === 1 || isProcessing}
      isNextDisabled={isNextDisabledForStep(VMWizardStep.TEMPLATE) || isProcessing}
      nextButtonProps={
        {
          'data-test': 'wizard-next-button',
          isLoading: isProcessing,
        } as Omit<ButtonProps, 'children'>
      }
      onBack={goToPrevStep}
      onClose={closeWizard}
      onNext={handleGoToNextStep}
    />
  );
};

export default TemplateStepFooter;
