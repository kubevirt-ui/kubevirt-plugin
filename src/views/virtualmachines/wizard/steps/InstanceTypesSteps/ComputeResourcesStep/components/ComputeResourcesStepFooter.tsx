import { type FC } from 'react';

import { useWizardContext, WizardFooter } from '@patternfly/react-core';
import {
  WIZARD_BACK_BUTTON_PROPS,
  WIZARD_CANCEL_BUTTON_PROPS,
  WIZARD_NEXT_BUTTON_PROPS,
} from '@virtualmachines/wizard/components/constants';
import useCloseWizard from '@virtualmachines/wizard/hooks/useCloseWizard';
import useWizardStepValidation from '@virtualmachines/wizard/hooks/useWizardStepValidation';
import { VMWizardStep } from '@virtualmachines/wizard/utils/constants';

const ComputeResourcesStepFooter: FC = () => {
  const { activeStep, goToNextStep, goToPrevStep } = useWizardContext();
  const closeWizard = useCloseWizard();
  const { isNextDisabledForStep } = useWizardStepValidation();

  return (
    <WizardFooter
      activeStep={activeStep}
      backButtonProps={WIZARD_BACK_BUTTON_PROPS}
      cancelButtonProps={WIZARD_CANCEL_BUTTON_PROPS}
      isBackDisabled={activeStep.index === 1}
      isNextDisabled={isNextDisabledForStep(VMWizardStep.COMPUTE_RESOURCES)}
      nextButtonProps={WIZARD_NEXT_BUTTON_PROPS}
      onBack={goToPrevStep}
      onClose={closeWizard}
      onNext={goToNextStep}
    />
  );
};

export default ComputeResourcesStepFooter;
