import type { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useWizardContext, WizardFooter } from '@patternfly/react-core';

import {
  BOOTABLE_VOLUME_WIZARD_STEPS,
  type BootableVolumeWizardStep,
} from '../form/stepValidation';
import type { BootableVolumeWizardNavItemConfig } from '../utils/types';

type BootableVolumeWizardFooterProps = {
  navigation: BootableVolumeWizardNavItemConfig;
};

const BootableVolumeWizardFooter: FC<BootableVolumeWizardFooterProps> = ({ navigation }) => {
  const { t } = useKubevirtTranslation();
  const { activeStep, goToStepByIndex, steps } = useWizardContext();

  const currentIndex = steps.findIndex((step) => step.id === activeStep.id);
  const previous = steps[currentIndex - 1];
  const next = steps[currentIndex + 1];

  const isFirstStep = activeStep.id === BOOTABLE_VOLUME_WIZARD_STEPS[0];
  const isBackDisabled = isFirstStep || !previous;
  const isNextDisabled = !next || navigation.isStepDisabled(next.id as BootableVolumeWizardStep);

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
