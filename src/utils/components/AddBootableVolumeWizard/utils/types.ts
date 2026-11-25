import type { ReactNode } from 'react';

import type { AddBootableVolumeModalProps } from '@kubevirt-utils/components/AddBootableVolumeModal/types';
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
  isExitConfirmOpen: boolean;
  isStepDisabled: (step: BootableVolumeWizardStep) => boolean;
  isSubmitting: boolean;
  onContinueAdding: () => void;
  onDismiss: () => void;
  onExitWithoutSaving: () => void;
  setIsSubmitting: (isSubmitting: boolean) => void;
};

export type BootableVolumeWizardStepDisplay = WizardStepProps & {
  children: ReactNode;
  displayIndex: number;
};

export type BootableVolumeWizardCallbacks = {
  onCreateVolume?: AddBootableVolumeModalProps['onCreateVolume'];
  onUploadStart?: AddBootableVolumeModalProps['onUploadStart'];
};
