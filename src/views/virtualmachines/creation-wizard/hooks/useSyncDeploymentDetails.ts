import { useCallback } from 'react';

import { getAnnotation } from '@kubevirt-utils/resources/shared';
import { DESCRIPTION_ANNOTATION, getFolder } from '@kubevirt-utils/resources/vm';
import { updateCustomizeInstanceType, vmSignal } from '@kubevirt-utils/store/customizeInstanceType';
import type { WizardStepType } from '@patternfly/react-core';
import useVMWizardStore from '@virtualmachines/creation-wizard/state/vm-wizard-store/useVMWizardStore';
import { VMWizardStep } from '@virtualmachines/creation-wizard/utils/constants';
import { VM_FOLDER_LABEL } from '@virtualmachines/tree/utils/constants';

type UseSyncDeploymentDetails = () => (
  currentStep: WizardStepType,
  prevStep: WizardStepType,
) => void;

/**
 * Keeps the wizard store's Deployment Details buffers in sync with vmSignal
 * across step transitions. Flushes store values to the signal when leaving
 * Deployment Details, and hydrates the store from the signal when entering it.
 */
export const useSyncDeploymentDetails: UseSyncDeploymentDetails = () => {
  const { folder, setFolder, setVMDescription, vmDescription } = useVMWizardStore();

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
          {
            data: folder || undefined,
            path: ['metadata', 'labels', VM_FOLDER_LABEL],
          },
        ]);
      }

      if (currentStep?.id === VMWizardStep.DEPLOYMENT_DETAILS) {
        setVMDescription(getAnnotation(vmSignal.value, DESCRIPTION_ANNOTATION, ''));
        setFolder(getFolder(vmSignal.value) || '');
      }
    },
    [folder, setFolder, setVMDescription, vmDescription],
  );
};
