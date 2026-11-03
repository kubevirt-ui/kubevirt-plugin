import type { ReactNode } from 'react';

import type { WizardStepProps, WizardStepType } from '@patternfly/react-core';

import type { BootableVolumeWizardStep } from '../form/stepValidation';

export type BootableVolumeWizardNavItemClickHandler = (
  step: WizardStepType,
  activeStep: WizardStepType,
  goToStepByIndex: (index: number) => void,
) => Promise<void> | void;

export type BootableVolumeWizardNavItemConfig = {
  handleClose: () => void;
  handleNavItemClick: BootableVolumeWizardNavItemClickHandler;
  isStepDisabled: (step: BootableVolumeWizardStep) => boolean;
};

export type BootableVolumeWizardStepDisplay = WizardStepProps & {
  children: ReactNode;
  displayIndex: number;
};
