import React, { FC } from 'react';
import classnames from 'classnames';

import { FLAG_LIGHTSPEED_PLUGIN } from '@kubevirt-utils/flags/consts';
import { useFlag } from '@openshift-console/dynamic-plugin-sdk';
import { useWizardContext, WizardFooter } from '@patternfly/react-core';
import useCloseWizard from '@virtualmachines/creation-wizard/hooks/useCloseWizard';
import useCreateVMFromInstanceType from '@virtualmachines/creation-wizard/steps/InstanceTypesSteps/hooks/useCreateVMFromInstanceType';

const ComputeResourcesStepFooter: FC = () => {
  const hasOLSConsole = useFlag(FLAG_LIGHTSPEED_PLUGIN);
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
      cancelButtonProps={{ className: classnames({ 'pf-v6-u-mr-4xl': hasOLSConsole }) }}
      isBackDisabled={activeStep.index === 1}
      onBack={goToPrevStep}
      onClose={closeWizard}
      onNext={handleGoToNextStep}
    />
  );
};

export default ComputeResourcesStepFooter;
