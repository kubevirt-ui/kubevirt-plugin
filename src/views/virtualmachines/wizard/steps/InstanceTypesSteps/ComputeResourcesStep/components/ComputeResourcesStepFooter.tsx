import React, { type FC } from 'react';

import { useWizardContext, WizardFooter } from '@patternfly/react-core';
import {
  WIZARD_BACK_BUTTON_PROPS,
  WIZARD_CANCEL_BUTTON_PROPS,
  WIZARD_NEXT_BUTTON_PROPS,
} from '@virtualmachines/wizard/components/constants';
import useCloseWizard from '@virtualmachines/wizard/hooks/useCloseWizard';
import useWizardStepValidation from '@virtualmachines/wizard/hooks/useWizardStepValidation';
import { VMWizardStep } from '@virtualmachines/wizard/utils/constants';
import { type EnsureGeneratedVM } from '@virtualmachines/wizard/utils/types';

type ComputeResourcesStepFooterProps = {
  ensureGeneratedVM: EnsureGeneratedVM;
  ready: boolean;
};

const ComputeResourcesStepFooter: FC<ComputeResourcesStepFooterProps> = ({
  ensureGeneratedVM,
  ready,
}) => {
  const { activeStep, goToNextStep, goToPrevStep } = useWizardContext();
  const closeWizard = useCloseWizard();
  const { isNextDisabledForStep } = useWizardStepValidation();

  const handleGoToNextStep = (): void => {
    if (!ensureGeneratedVM()) {
      return;
    }

    void goToNextStep();
  };

  return (
    <WizardFooter
      activeStep={activeStep}
      backButtonProps={WIZARD_BACK_BUTTON_PROPS}
      cancelButtonProps={WIZARD_CANCEL_BUTTON_PROPS}
      isBackDisabled={activeStep.index === 1}
      isNextDisabled={isNextDisabledForStep(VMWizardStep.COMPUTE_RESOURCES) || !ready}
      nextButtonProps={{ ...WIZARD_NEXT_BUTTON_PROPS, isLoading: !ready }}
      onBack={goToPrevStep}
      onClose={closeWizard}
      onNext={handleGoToNextStep}
    />
  );
};

export default ComputeResourcesStepFooter;
