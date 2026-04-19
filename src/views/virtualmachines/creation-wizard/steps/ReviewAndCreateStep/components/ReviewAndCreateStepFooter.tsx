import React, { FC } from 'react';
import classnames from 'classnames';

import { FLAG_LIGHTSPEED_PLUGIN } from '@kubevirt-utils/flags/consts';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useFlag } from '@openshift-console/dynamic-plugin-sdk';
import { useWizardContext, WizardFooter } from '@patternfly/react-core';
import useCloseWizard from '@virtualmachines/creation-wizard/hooks/useCloseWizard';
import useCreateVM from '@virtualmachines/creation-wizard/hooks/useCreateVM';
import useVMWizardStore from '@virtualmachines/creation-wizard/state/vm-wizard-store/useVMWizardStore';
import { isCloneCreationMethod } from '@virtualmachines/creation-wizard/utils/utils';

const ReviewAndCreateStepFooter: FC = () => {
  const hasOLSConsole = useFlag(FLAG_LIGHTSPEED_PLUGIN);
  const { activeStep, goToPrevStep } = useWizardContext();
  const { creationMethod, vmNameConfirmed } = useVMWizardStore();
  const isCloneMethod = isCloneCreationMethod(creationMethod);
  const createVM = useCreateVM();
  const closeWizard = useCloseWizard();

  return (
    <WizardFooter
      activeStep={activeStep}
      cancelButtonProps={{ className: classnames({ 'pf-v6-u-mr-4xl': hasOLSConsole }) }}
      isNextDisabled={!vmNameConfirmed}
      nextButtonText={isCloneMethod ? t('Clone VirtualMachine') : t('Create VirtualMachine')}
      onBack={goToPrevStep}
      onClose={closeWizard}
      onNext={createVM}
    />
  );
};

export default ReviewAndCreateStepFooter;
