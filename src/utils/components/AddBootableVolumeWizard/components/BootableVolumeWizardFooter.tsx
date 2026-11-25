import type { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useWizardContext, WizardFooter } from '@patternfly/react-core';

import {
  BOOTABLE_VOLUME_WIZARD_STEPS,
  BootableVolumeWizardStep,
  type BootableVolumeWizardStep as WizardStepId,
} from '../form/stepValidation';
import useBootableVolumeWizardSave from '../hooks/useBootableVolumeWizardSave';
import type {
  BootableVolumeWizardCallbacks,
  BootableVolumeWizardNavItemConfig,
} from '../utils/types';
import BootableVolumeWizardReviewFooter from './BootableVolumeWizardReviewFooter';

type BootableVolumeWizardFooterProps = BootableVolumeWizardCallbacks & {
  navigation: BootableVolumeWizardNavItemConfig;
};

const BootableVolumeWizardFooter: FC<BootableVolumeWizardFooterProps> = ({
  navigation,
  onCreateVolume,
  onUploadStart,
}) => {
  const { t } = useKubevirtTranslation();
  const { activeStep, goToStepById, goToStepByIndex, steps } = useWizardContext();
  const { error, onSave } = useBootableVolumeWizardSave({
    goToStepById,
    onClose: navigation.onDismiss,
    onCreateVolume,
    onUploadStart,
    setIsSubmitting: navigation.setIsSubmitting,
  });

  const currentIndex = steps.findIndex((step) => step.id === activeStep.id);
  const previous = steps[currentIndex - 1];
  const next = steps[currentIndex + 1];

  const isFirstStep = activeStep.id === BOOTABLE_VOLUME_WIZARD_STEPS[0];
  const isReviewStep = activeStep.id === BootableVolumeWizardStep.REVIEW;
  const isBackDisabled = isFirstStep || !previous || navigation.isSubmitting;
  const isNextDisabled =
    !next || navigation.isStepDisabled(next.id as WizardStepId) || navigation.isSubmitting;

  if (isReviewStep) {
    return (
      <BootableVolumeWizardReviewFooter
        error={error}
        isSubmitting={navigation.isSubmitting}
        navigation={navigation}
        onSave={onSave}
      />
    );
  }

  return (
    <WizardFooter
      activeStep={activeStep}
      backButtonText={t('Back')}
      cancelButtonText={t('Cancel')}
      isBackDisabled={isBackDisabled}
      isNextDisabled={isNextDisabled}
      nextButtonText={t('Next')}
      onBack={() => {
        if (previous) void navigation.handleNavItemClick(previous, activeStep, goToStepByIndex);
      }}
      onClose={navigation.handleClose}
      onNext={() => {
        if (next) void navigation.handleNavItemClick(next, activeStep, goToStepByIndex);
      }}
    />
  );
};

export default BootableVolumeWizardFooter;
