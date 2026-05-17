import React, { FC } from 'react';

import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useWizardContext, WizardFooter } from '@patternfly/react-core';
import useCloseWizard from '@virtualmachines/creation-wizard/hooks/useCloseWizard';
import useCreateVM from '@virtualmachines/creation-wizard/hooks/useCreateVM';
import useVMWizardStore from '@virtualmachines/creation-wizard/state/vm-wizard-store/useVMWizardStore';
import { isCloneCreationMethod } from '@virtualmachines/creation-wizard/utils/utils';

const ReviewAndCreateStepFooter: FC = () => {
  const { activeStep, goToPrevStep } = useWizardContext();
  const { creationMethod, isVMNameValid } = useVMWizardStore();
  const isCloneMethod = isCloneCreationMethod(creationMethod);
  const createVM = useCreateVM();
  const closeWizard = useCloseWizard();

  return (
    <WizardFooter
      activeStep={activeStep}
      isNextDisabled={!isVMNameValid}
      nextButtonText={isCloneMethod ? t('Clone VirtualMachine') : t('Create VirtualMachine')}
      onBack={goToPrevStep}
      onClose={closeWizard}
      onNext={createVM}
    />
  );
};

export default ReviewAndCreateStepFooter;
