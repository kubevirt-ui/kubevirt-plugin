import React, { FC } from 'react';

import { useWizardContext, WizardFooter } from '@patternfly/react-core';
import useCloseWizard from '@virtualmachines/creation-wizard-new/hooks/useCloseWizard';
import useWizardStepValidation from '@virtualmachines/creation-wizard-new/hooks/useWizardStepValidation';
import useCreateVMFromInstanceType from '@virtualmachines/creation-wizard-new/steps/InstanceTypesSteps/hooks/useCreateVMFromInstanceType';
import { VMWizardStep } from '@virtualmachines/creation-wizard-new/utils/constants';

const ComputeResourcesStepFooter: FC = () => {
  const { activeStep, goToNextStep, goToPrevStep } = useWizardContext();
  const handleCreateVM = useCreateVMFromInstanceType();
  const closeWizard = useCloseWizard();
  const { isNextDisabledForStep } = useWizardStepValidation();

  const handleGoToNextStep = async () => {
    await handleCreateVM();
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
