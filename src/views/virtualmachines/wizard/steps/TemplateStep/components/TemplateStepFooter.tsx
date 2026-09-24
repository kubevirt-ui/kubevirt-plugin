import { type FC } from 'react';

import { useWizardContext, WizardFooter } from '@patternfly/react-core';
import {
  WIZARD_BACK_BUTTON_PROPS,
  WIZARD_CANCEL_BUTTON_PROPS,
  WIZARD_NEXT_BUTTON_PROPS,
} from '@virtualmachines/wizard/components/constants';
import useCloseWizard from '@virtualmachines/wizard/hooks/useCloseWizard';
import useWizardStepValidation from '@virtualmachines/wizard/hooks/useWizardStepValidation';
import { useVMWizardState } from '@virtualmachines/wizard/state/useVMWizardState';
import useCreateVMFromTemplate from '@virtualmachines/wizard/steps/TemplateStep/hooks/useCreateVMFromTemplate';
import { VMWizardStep } from '@virtualmachines/wizard/utils/constants';

const TemplateStepFooter: FC = () => {
  const { activeStep, goToNextStep, goToPrevStep } = useWizardContext();
  const { setIsTemplateDrawerOpen } = useVMWizardState();
  const { createVMFromTemplate, isProcessing } = useCreateVMFromTemplate();
  const closeWizard = useCloseWizard();
  const { isNextDisabledForStep } = useWizardStepValidation();

  const handleGoToNextStep = async (): Promise<void> => {
    const success = await createVMFromTemplate();
    if (!success) return;

    setIsTemplateDrawerOpen(false);
    void goToNextStep();
  };

  return (
    <WizardFooter
      activeStep={activeStep}
      backButtonProps={WIZARD_BACK_BUTTON_PROPS}
      cancelButtonProps={{ ...WIZARD_CANCEL_BUTTON_PROPS, isDisabled: isProcessing }}
      isBackDisabled={activeStep.index === 1 || isProcessing}
      isNextDisabled={isNextDisabledForStep(VMWizardStep.TEMPLATE) || isProcessing}
      nextButtonProps={{ ...WIZARD_NEXT_BUTTON_PROPS, isLoading: isProcessing }}
      onBack={goToPrevStep}
      onClose={closeWizard}
      onNext={handleGoToNextStep}
    />
  );
};

export default TemplateStepFooter;
