import React, { FC } from 'react';

import { useWizardContext, WizardFooter } from '@patternfly/react-core';
import useCloseWizard from '@virtualmachines/wizard/hooks/useCloseWizard';

type DefaultWizardFooterProps = {
  isNextDisabled?: boolean;
};

const DefaultWizardFooter: FC<DefaultWizardFooterProps> = ({ isNextDisabled }) => {
  const { activeStep, goToNextStep, goToPrevStep } = useWizardContext();
  const closeWizard = useCloseWizard();

  return (
    <WizardFooter
      activeStep={activeStep}
      backButtonProps={{ 'data-test': 'wizard-back-button' } as any}
      cancelButtonProps={{ 'data-test': 'wizard-cancel-button' } as any}
      isBackDisabled={activeStep.index === 1}
      isNextDisabled={isNextDisabled}
      nextButtonProps={{ 'data-test': 'wizard-next-button' } as any}
      onBack={goToPrevStep}
      onClose={closeWizard}
      onNext={goToNextStep}
    />
  );
};

export default DefaultWizardFooter;
