import { useCallback } from 'react';

import { getAnnotation } from '@kubevirt-utils/resources/shared';
import { DESCRIPTION_ANNOTATION } from '@kubevirt-utils/resources/vm';
import { updateCustomizeInstanceType, vmSignal } from '@kubevirt-utils/store/customizeInstanceType';
import type { WizardStepType } from '@patternfly/react-core';
import useVMWizardStore from '@virtualmachines/creation-wizard/state/vm-wizard-store/useVMWizardStore';
import { VMWizardStep } from '@virtualmachines/creation-wizard/utils/constants';

type UseSyncDescription = () => (currentStep: WizardStepType, prevStep: WizardStepType) => void;

/**
 * Keeps the wizard store's vmDescription buffer in sync with vmSignal's annotation
 * across step transitions. Flushes the buffer to the signal when leaving Deployment Details,
 * and hydrates the buffer from the signal when entering Deployment Details.
 */
const useSyncDescription: UseSyncDescription = () => {
  const { setVMDescription, vmDescription } = useVMWizardStore();

  return useCallback(
    (currentStep: WizardStepType, prevStep: WizardStepType) => {
      if (!vmSignal.value) {
        return;
      }

      if (prevStep?.id === VMWizardStep.DEPLOYMENT_DETAILS) {
        updateCustomizeInstanceType([
          {
            data: vmDescription || undefined,
            path: `metadata.annotations.${DESCRIPTION_ANNOTATION}`,
          },
        ]);
      }

      if (currentStep?.id === VMWizardStep.DEPLOYMENT_DETAILS) {
        setVMDescription(getAnnotation(vmSignal.value, DESCRIPTION_ANNOTATION, ''));
      }
    },
    [setVMDescription, vmDescription],
  );
};

export default useSyncDescription;
