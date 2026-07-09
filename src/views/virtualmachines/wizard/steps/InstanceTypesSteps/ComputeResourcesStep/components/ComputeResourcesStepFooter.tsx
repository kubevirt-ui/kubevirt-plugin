import React, { FC } from 'react';

import { setCustomizeWizardVMSignal } from '@kubevirt-utils/signals/customizeWizardVMSignal';
import { useWizardContext, WizardFooter } from '@patternfly/react-core';
import useCloseWizard from '@virtualmachines/wizard/hooks/useCloseWizard';
import useWizardStepValidation from '@virtualmachines/wizard/hooks/useWizardStepValidation';
import { VMWizardStep } from '@virtualmachines/wizard/utils/constants';
import useGenerateVM from '../../hooks/useGenerateVM/useGenerateVM';

const ComputeResourcesStepFooter: FC = () => {
  const { activeStep, goToNextStep, goToPrevStep } = useWizardContext();
  const generatedVM = useGenerateVM();
  const closeWizard = useCloseWizard();
  const { isNextDisabledForStep } = useWizardStepValidation();

  const handleGoToNextStep = () => {
    setCustomizeWizardVMSignal(generatedVM);
    goToNextStep();
  };

  return (
    <WizardFooter
      activeStep={activeStep}
      isBackDisabled={activeStep.index === 1}
      isNextDisabled={isNextDisabledForStep(VMWizardStep.COMPUTE_RESOURCES)}
      onBack={goToPrevStep}
      onClose={closeWizard}
      onNext={handleGoToNextStep}
    />
  );
};

export default ComputeResourcesStepFooter;
