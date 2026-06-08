import React, { FC } from 'react';
import classnames from 'classnames';

import ErrorAlert from '@kubevirt-utils/components/ErrorAlert/ErrorAlert';
import { FLAG_LIGHTSPEED_PLUGIN } from '@kubevirt-utils/flags/consts';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useFlag } from '@openshift-console/dynamic-plugin-sdk';
import { Stack, useWizardContext, WizardFooter } from '@patternfly/react-core';
import useCloseWizard from '@virtualmachines/creation-wizard/hooks/useCloseWizard';
import useCreateVM from '@virtualmachines/creation-wizard/hooks/useCreateVM';
import useVMWizardStore from '@virtualmachines/creation-wizard/state/vm-wizard-store/useVMWizardStore';
import { isCloneCreationMethod } from '@virtualmachines/creation-wizard/utils/utils';

const ReviewAndCreateStepFooter: FC = () => {
  const hasOLSConsole = useFlag(FLAG_LIGHTSPEED_PLUGIN);
  const { activeStep, goToPrevStep } = useWizardContext();
  const { creationMethod, isVMNameValid } = useVMWizardStore();
  const isCloneMethod = isCloneCreationMethod(creationMethod);
  const { createVM, error, isSubmitting } = useCreateVM();
  const closeWizard = useCloseWizard();

  return (
    <Stack hasGutter>
      {error && <ErrorAlert error={error} />}
      <WizardFooter
        activeStep={activeStep}
        cancelButtonProps={{ className: classnames({ 'pf-v6-u-mr-4xl': hasOLSConsole }) }}
        isNextDisabled={!isVMNameValid || isSubmitting}
        nextButtonText={isCloneMethod ? t('Clone VirtualMachine') : t('Create VirtualMachine')}
        onBack={goToPrevStep}
        onClose={closeWizard}
        onNext={createVM}
      />
    </Stack>
  );
};

export default ReviewAndCreateStepFooter;
