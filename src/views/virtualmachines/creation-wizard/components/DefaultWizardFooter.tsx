import React, { FCC } from 'react';
import classnames from 'classnames';

import { FLAG_LIGHTSPEED_PLUGIN } from '@kubevirt-utils/flags/consts';
import { useFlag } from '@openshift-console/dynamic-plugin-sdk';
import { useWizardContext, WizardFooter } from '@patternfly/react-core';
import useCloseWizard from '@virtualmachines/creation-wizard/hooks/useCloseWizard';

const DefaultWizardFooter: FCC = () => {
  const { activeStep, goToNextStep, goToPrevStep } = useWizardContext();
  const closeWizard = useCloseWizard();
  const hasOLSConsole = useFlag(FLAG_LIGHTSPEED_PLUGIN);

  return (
    <WizardFooter
      activeStep={activeStep}
      cancelButtonProps={{ className: classnames({ 'pf-v6-u-mr-4xl': hasOLSConsole }) }}
      isBackDisabled={activeStep.index === 1}
      onBack={goToPrevStep}
      onClose={closeWizard}
      onNext={goToNextStep}
    />
  );
};

export default DefaultWizardFooter;
