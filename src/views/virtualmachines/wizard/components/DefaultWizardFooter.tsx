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
      isBackDisabled={activeStep.index === 1}
      isNextDisabled={isNextDisabled}
      onBack={goToPrevStep}
      onClose={closeWizard}
      onNext={goToNextStep}
    />
  );
};

export default DefaultWizardFooter;
