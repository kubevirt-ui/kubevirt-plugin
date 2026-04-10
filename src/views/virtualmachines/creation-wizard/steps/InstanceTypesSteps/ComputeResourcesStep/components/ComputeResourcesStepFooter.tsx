import React, { FC } from 'react';

import { useWizardContext, WizardFooter } from '@patternfly/react-core';
import useCloseWizard from '@virtualmachines/creation-wizard/hooks/useCloseWizard';
import useCreateVMFromInstanceType from '@virtualmachines/creation-wizard/steps/InstanceTypesSteps/hooks/useCreateVMFromInstanceType';

const ComputeResourcesStepFooter: FC = () => {
  const { activeStep, goToNextStep, goToPrevStep } = useWizardContext();
  const handleCreateVM = useCreateVMFromInstanceType();
  const closeWizard = useCloseWizard();

  const handleGoToNextStep = async () => {
    await handleCreateVM();
    goToNextStep();
  };

  return (
    <WizardFooter
      activeStep={activeStep}
      isBackDisabled={activeStep.index === 1}
      onBack={goToPrevStep}
      onClose={closeWizard}
      onNext={handleGoToNextStep}
    />
  );
};

export default ComputeResourcesStepFooter;
