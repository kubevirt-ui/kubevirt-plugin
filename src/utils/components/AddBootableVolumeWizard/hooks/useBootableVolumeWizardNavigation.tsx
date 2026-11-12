import { useCallback, useRef } from 'react';
import { useWatch } from 'react-hook-form';

import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import type { WizardStepType } from '@patternfly/react-core';
import ExitWizardModal from '@virtualmachines/wizard/components/ExitWizardModal';

import { useBootableVolumeWizardForm } from '../form/BootableVolumeWizardFormProvider';
import { volumeNameInputSchema } from '../form/schema/createProjectAndVolumeSchema';
import {
  BOOTABLE_VOLUME_WIZARD_STEPS,
  BootableVolumeWizardStep,
  getBootableVolumeWizardNavigationPrerequisites,
  mapBootableVolumeWizardErrorsToSteps,
  triggerBootableVolumeWizardStepValidation,
} from '../form/stepValidation';
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
  const { currentStep, visitedSteps } = useBootableVolumeWizardState();
  const { createModal } = useModal();
  const navigatingRef = useRef(false);

  const [volumeName, destinationProject] = useWatch({
    control,
    name: ['projectAndVolume.volumeName', 'projectAndVolume.destinationProject'],
  });

  const errorsByStep = mapBootableVolumeWizardErrorsToSteps(formState.errors);

  const isStepValid = useCallback(
    (stepId: BootableVolumeWizardStep): boolean => {
      if (stepId !== BootableVolumeWizardStep.PROJECT_AND_VOLUME || currentStep !== stepId) {
        return !errorsByStep[stepId];
      }

      return (
        !errorsByStep[stepId] &&
        volumeNameInputSchema.isValidSync(volumeName) &&
        Boolean(destinationProject?.trim())
      );
    },
    [currentStep, destinationProject, errorsByStep, volumeName],
  );

  const openExitModal = useCallback((): void => {
    createModal(({ isOpen, onClose: closeModal }) => (
      <ExitWizardModal
        continueButtonText={t('Continue adding')}
        isOpen={isOpen}
        onClose={closeModal}
        onExit={() => {
          closeModal();
          onClose();
        }}
        title={t('Exit "Add bootable volume"?')}
      />
    ));
  }, [createModal, onClose, t]);

  const handleClose = useCallback((): void => {
    if (formState.isDirty) {
      openExitModal();
    } else {
      onClose();
    }
  }, [formState.isDirty, onClose, openExitModal]);

  const isStepDisabled = useCallback(
    (stepId: BootableVolumeWizardStep): boolean => {
      const currentIndex = BOOTABLE_VOLUME_WIZARD_STEPS.indexOf(currentStep);
      const targetIndex = BOOTABLE_VOLUME_WIZARD_STEPS.indexOf(stepId);

      if (targetIndex <= currentIndex) return false;

      const prerequisites = getBootableVolumeWizardNavigationPrerequisites(currentStep, stepId);
      return prerequisites.some((prereq) => !visitedSteps.has(prereq) || !isStepValid(prereq));
    },
    [currentStep, isStepValid, visitedSteps],
  );

  const handleNavItemClick = useCallback(
    async (
      step: WizardStepType,
      activeStep: WizardStepType,
      goToStepByIndex: (index: number) => void,
    ): Promise<void> => {
      if (navigatingRef.current) return;

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

        const isValid = await triggerBootableVolumeWizardStepValidation(trigger, prerequisites);
        if (!isValid) return;

        goToStepByIndex(step.index);
      } finally {
        navigatingRef.current = false;
      }
    },
    [trigger, visitedSteps],
  );

  return {
    handleClose,
    handleNavItemClick,
    isStepDisabled,
  };
};

export default useBootableVolumeWizardNavigation;
