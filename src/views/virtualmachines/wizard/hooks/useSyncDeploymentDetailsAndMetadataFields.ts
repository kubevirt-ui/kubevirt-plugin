import { useCallback } from 'react';

import { DESCRIPTION_ANNOTATION } from '@kubevirt-utils/resources/vm';
import type { WizardStepType } from '@patternfly/react-core';
import { VM_FOLDER_LABEL } from '@virtualmachines/tree/utils/constants';
import { useVMWizardForm } from '@virtualmachines/wizard/form/VMWizardFormProvider';
import { VMWizardStep } from '@virtualmachines/wizard/utils/constants';
import { patchWizardCustomizedVM } from '@virtualmachines/wizard/utils/patchWizardCustomizedVM';

type UseSyncDeploymentDetailsAndMetadataFieldsReturn = {
  syncDescriptionFieldAndMetadataAnnotations: (description: string) => void;
  syncFolderFieldAndMetadataLabels: (folder: string) => void;
  syncOnDeploymentDetailsStepChange: (
    currentStep: WizardStepType,
    prevStep: WizardStepType,
  ) => void;
};

/**
 * The customization.vmDraft form field can edit annotations (includes description) and labels (includes folder) in the Customization step.
 * This hook keeps the form's Deployment Details buffers in sync with customization.vmDraft's metadata
 * across step transitions. Flushes non-empty deployment.description and deployment.folder values
 * to customization.vmDraft when entering or leaving Deployment Details.
 */
export const useSyncDeploymentDetailsAndMetadataFields =
  (): UseSyncDeploymentDetailsAndMetadataFieldsReturn => {
    const { getValues, setValue } = useVMWizardForm();

    const syncDescriptionFieldAndMetadataAnnotations = useCallback(
      (description: string) => {
        const metadataPatch = description
          ? [
              {
                data: description,
                path: `metadata.annotations.${DESCRIPTION_ANNOTATION}`,
              },
            ]
          : [];

        patchWizardCustomizedVM(getValues, setValue, metadataPatch);
        setValue('deployment.description', description);
      },
      [getValues, setValue],
    );

    const syncFolderFieldAndMetadataLabels = useCallback(
      (folder: string) => {
        const metadataPatch = folder
          ? [
              {
                data: folder,
                path: ['metadata', 'labels', VM_FOLDER_LABEL],
              },
            ]
          : [];

        patchWizardCustomizedVM(getValues, setValue, metadataPatch);
        setValue('deployment.folder', folder);
      },
      [getValues, setValue],
    );

    const syncOnDeploymentDetailsStepChange = useCallback(
      (currentStep: WizardStepType, prevStep: WizardStepType) => {
        if (
          prevStep?.id !== VMWizardStep.DEPLOYMENT_DETAILS &&
          currentStep?.id !== VMWizardStep.DEPLOYMENT_DETAILS
        ) {
          return;
        }
        const { description, folder } = getValues('deployment');
        syncDescriptionFieldAndMetadataAnnotations(description);
        syncFolderFieldAndMetadataLabels(folder);
      },
      [getValues, syncDescriptionFieldAndMetadataAnnotations, syncFolderFieldAndMetadataLabels],
    );

    return {
      syncDescriptionFieldAndMetadataAnnotations,
      syncFolderFieldAndMetadataLabels,
      syncOnDeploymentDetailsStepChange,
    };
  };
