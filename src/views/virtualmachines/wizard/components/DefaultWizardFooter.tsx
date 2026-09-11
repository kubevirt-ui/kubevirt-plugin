import { type FC } from 'react';

import { useWizardContext, WizardFooter } from '@patternfly/react-core';
import useCloseWizard from '@virtualmachines/wizard/hooks/useCloseWizard';

import {
  WIZARD_BACK_BUTTON_PROPS,
  WIZARD_CANCEL_BUTTON_PROPS,
  WIZARD_NEXT_BUTTON_PROPS,
} from './constants';

type DefaultWizardFooterProps = {
  isNextDisabled?: boolean;
};

const DefaultWizardFooter: FC<DefaultWizardFooterProps> = ({ isNextDisabled }) => {
  const { activeStep, goToNextStep, goToPrevStep } = useWizardContext();
  const closeWizard = useCloseWizard();

  return (
    <WizardFooter
      activeStep={activeStep}
      backButtonProps={WIZARD_BACK_BUTTON_PROPS}
      cancelButtonProps={WIZARD_CANCEL_BUTTON_PROPS}
      isBackDisabled={activeStep.index === 1}
      isNextDisabled={isNextDisabled}
      nextButtonProps={WIZARD_NEXT_BUTTON_PROPS}
      onBack={goToPrevStep}
      onClose={closeWizard}
      onNext={goToNextStep}
    />
  );
};

export default DefaultWizardFooter;
