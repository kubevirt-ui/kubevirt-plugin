import React, { FC } from 'react';

import { useWizardContext, WizardFooter } from '@patternfly/react-core';
import useCloseWizard from '@virtualmachines/creation-wizard-new/hooks/useCloseWizard';
import useWizardStepValidation from '@virtualmachines/creation-wizard-new/hooks/useWizardStepValidation';
import useVMWizardStore from '@virtualmachines/creation-wizard-new/state/vm-wizard-store/useVMWizardStore';
import useCreateVMFromTemplate from '@virtualmachines/creation-wizard-new/steps/TemplateStep/hooks/useCreateVMFromTemplate';
import { VMWizardStep } from '@virtualmachines/creation-wizard-new/utils/constants';

const TemplateStepFooter: FC = () => {
  const { activeStep, goToNextStep, goToPrevStep } = useWizardContext();
  const { createVMFromTemplate } = useCreateVMFromTemplate();
  const closeWizard = useCloseWizard();
  const { setTemplatesDrawerIsOpen } = useVMWizardStore();
  const { isNextDisabledForStep } = useWizardStepValidation();

  const handleGoToNextStep = async () => {
    await createVMFromTemplate();
    setTemplatesDrawerIsOpen(false);
    goToNextStep();
  };

  return (
    <WizardFooter
      activeStep={activeStep}
      isBackDisabled={activeStep.index === 1}
      isNextDisabled={isNextDisabledForStep(VMWizardStep.TEMPLATE)}
      onBack={goToPrevStep}
      onClose={closeWizard}
      onNext={handleGoToNextStep}
    />
  );
};

export default TemplateStepFooter;
