import React, { FC } from 'react';
import classnames from 'classnames';

import { FLAG_LIGHTSPEED_PLUGIN } from '@kubevirt-utils/flags/consts';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { useFlag } from '@openshift-console/dynamic-plugin-sdk';
import { useWizardContext, WizardFooter } from '@patternfly/react-core';
import useCloseWizard from '@virtualmachines/creation-wizard/hooks/useCloseWizard';
import useVMWizardStore from '@virtualmachines/creation-wizard/state/vm-wizard-store/useVMWizardStore';
import useCreateVMFromTemplate from '@virtualmachines/creation-wizard/steps/TemplateStep/hooks/useCreateVMFromTemplate';

const TemplateStepFooter: FC = ({}) => {
  const hasOLSConsole = useFlag(FLAG_LIGHTSPEED_PLUGIN);
  const { activeStep, goToNextStep, goToPrevStep } = useWizardContext();
  const { createVMFromTemplate } = useCreateVMFromTemplate();
  const closeWizard = useCloseWizard();
  const { selectedTemplate, setTemplatesDrawerIsOpen } = useVMWizardStore();

  const handleGoToNextStep = async () => {
    await createVMFromTemplate();
    setTemplatesDrawerIsOpen(false);
    goToNextStep();
  };

  return (
    <WizardFooter
      activeStep={activeStep}
      cancelButtonProps={{ className: classnames({ 'pf-v6-u-mr-4xl': hasOLSConsole }) }}
      isBackDisabled={activeStep.index === 1}
      isNextDisabled={isEmpty(selectedTemplate)}
      onBack={goToPrevStep}
      onClose={closeWizard}
      onNext={handleGoToNextStep}
    />
  );
};

export default TemplateStepFooter;
