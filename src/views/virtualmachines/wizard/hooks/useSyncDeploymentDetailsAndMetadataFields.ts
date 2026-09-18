import { useCallback } from 'react';

import { DESCRIPTION_ANNOTATION } from '@kubevirt-utils/resources/vm';
import type { WizardStepType } from '@patternfly/react-core';
import { VM_FOLDER_LABEL } from '@virtualmachines/tree/utils/constants';
import { useVMWizard } from '@virtualmachines/wizard/state/vm-wizard-context/VMWizardContext';
import { CREATE_VM_FORM_FIELDS_VM_DATA } from '@virtualmachines/wizard/state/vm-wizard-form/consts';
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
 * CustomizedVM form field can edit annotations (includes description) and labels (includes folder) in Customization step.
 * This hook keeps the form's Deployment Details buffers in sync with customizedVM's annotation
 * across step transitions. Flushes the form value to the customizedVM when leaving Deployment Details,
 * and hydrates the form from the customizedVM when entering Deployment Details.
 */
export const useSyncDeploymentDetailsAndMetadataFields =
  (): UseSyncDeploymentDetailsAndMetadataFieldsReturn => {
    const { getValues, setValue } = useVMWizard();

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
        setValue(CREATE_VM_FORM_FIELDS_VM_DATA.DESCRIPTION, description);
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
        setValue(CREATE_VM_FORM_FIELDS_VM_DATA.FOLDER, folder);
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
        const { description, folder } = getValues(CREATE_VM_FORM_FIELDS_VM_DATA.ROOT);
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
