import { useCallback, useMemo, useRef, useState } from 'react';
import { useFormState, useWatch } from 'react-hook-form';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import type { WizardStepType } from '@patternfly/react-core';

import { useBootableVolumeWizardForm } from '../form/BootableVolumeWizardFormProvider';
import {
  DESTINATION_PROJECT_FIELD,
  IMAGE_SOURCE_FIELD,
  OPERATING_SYSTEM_FIELD,
  VOLUME_NAME_FIELD,
} from '../form/fieldPaths';
import { createImageSourceSchema } from '../form/schema/createImageSourceSchema';
import { volumeNameInputSchema } from '../form/schema/createProjectAndVolumeSchema';
import {
  BOOTABLE_VOLUME_WIZARD_STEPS,
  BootableVolumeWizardStep,
  getBootableVolumeWizardNavigationPrerequisites,
  mapBootableVolumeWizardErrorsToSteps,
  triggerBootableVolumeWizardStepValidation,
} from '../form/stepValidation';
import type { BootableVolumeWizardImageSourceValues } from '../form/types';
import type { BootableVolumeWizardNavItemConfig } from '../utils/types';
import { useBootableVolumeWizardState } from './useBootableVolumeWizardState';

type UseBootableVolumeWizardNavigationArgs = {
  onClose: () => void;
};

const useBootableVolumeWizardNavigation = ({
  onClose,
}: UseBootableVolumeWizardNavigationArgs): BootableVolumeWizardNavItemConfig => {
  const { t } = useKubevirtTranslation();
  const { control, formState, trigger } = useBootableVolumeWizardForm();
  const { isDirty } = useFormState({ control });
  const { currentStep, visitedSteps } = useBootableVolumeWizardState();
  const navigatingRef = useRef(false);
  const [isExitConfirmOpen, setIsExitConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [volumeName, destinationProject, operatingSystem, imageSource] = useWatch({
    control,
    name: [
      VOLUME_NAME_FIELD,
      DESTINATION_PROJECT_FIELD,
      OPERATING_SYSTEM_FIELD,
      IMAGE_SOURCE_FIELD,
    ],
  });

  const errorsByStep = mapBootableVolumeWizardErrorsToSteps(formState.errors);
  const imageSourceSchema = useMemo(() => createImageSourceSchema(t), [t]);

  const shouldConfirmExit =
    isDirty || Boolean(volumeName?.trim()) || Boolean(operatingSystem?.trim());

  const isStepValid = useCallback(
    (stepId: BootableVolumeWizardStep): boolean => {
      if (errorsByStep[stepId]) {
        return false;
      }

      switch (stepId) {
        case BootableVolumeWizardStep.PROJECT_AND_VOLUME:
          return (
            volumeNameInputSchema.isValidSync(volumeName) && Boolean(destinationProject?.trim())
          );
        case BootableVolumeWizardStep.IMAGE_SOURCE:
          return imageSourceSchema.isValidSync(
            imageSource as BootableVolumeWizardImageSourceValues,
          );
        case BootableVolumeWizardStep.OPERATING_SYSTEM:
          return Boolean(operatingSystem?.trim());
        case BootableVolumeWizardStep.REVIEW:
          return true;
        default:
          return true;
      }
    },
    [destinationProject, errorsByStep, imageSource, imageSourceSchema, operatingSystem, volumeName],
  );

  const handleClose = useCallback((): void => {
    if (isSubmitting) {
      return;
    }

    if (shouldConfirmExit) {
      setIsExitConfirmOpen(true);
      return;
    }

    onClose();
  }, [isSubmitting, onClose, shouldConfirmExit]);

  const onContinueAdding = useCallback((): void => {
    setIsExitConfirmOpen(false);
  }, []);

  const onExitWithoutSaving = useCallback((): void => {
    if (isSubmitting) {
      return;
    }

    setIsExitConfirmOpen(false);
    onClose();
  }, [isSubmitting, onClose]);

  const isStepDisabled = useCallback(
    (stepId: BootableVolumeWizardStep): boolean => {
      if (isSubmitting) {
        return true;
      }

      const currentIndex = BOOTABLE_VOLUME_WIZARD_STEPS.indexOf(currentStep);
      const targetIndex = BOOTABLE_VOLUME_WIZARD_STEPS.indexOf(stepId);

      if (targetIndex <= currentIndex) return false;

      const prerequisites = getBootableVolumeWizardNavigationPrerequisites(currentStep, stepId);
      return prerequisites.some((prereq) => !visitedSteps.has(prereq) || !isStepValid(prereq));
    },
    [currentStep, isStepValid, isSubmitting, visitedSteps],
  );

  const handleNavItemClick = useCallback(
    async (
      step: WizardStepType,
      activeStep: WizardStepType,
      goToStepByIndex: (index: number) => void,
    ): Promise<void> => {
      if (isSubmitting || navigatingRef.current) return;

      const target = step.id as BootableVolumeWizardStep;
      const current = activeStep.id as BootableVolumeWizardStep;
      const currentIndex = BOOTABLE_VOLUME_WIZARD_STEPS.indexOf(current);
      const targetIndex = BOOTABLE_VOLUME_WIZARD_STEPS.indexOf(target);

      if (targetIndex <= currentIndex) {
        goToStepByIndex(step.index);
        return;
      }

      navigatingRef.current = true;

      try {
        const prerequisites = getBootableVolumeWizardNavigationPrerequisites(current, target);

        if (prerequisites.some((prereq) => !visitedSteps.has(prereq))) {
          return;
        }

        const stepValid = await triggerBootableVolumeWizardStepValidation(trigger, prerequisites);
        if (!stepValid) return;

        goToStepByIndex(step.index);
      } finally {
        navigatingRef.current = false;
      }
    },
    [isSubmitting, trigger, visitedSteps],
  );

  return {
    handleClose,
    handleNavItemClick,
    isExitConfirmOpen,
    isStepDisabled,
    isSubmitting,
    onContinueAdding,
    onDismiss: onClose,
    onExitWithoutSaving,
    setIsSubmitting,
  };
};

export default useBootableVolumeWizardNavigation;
