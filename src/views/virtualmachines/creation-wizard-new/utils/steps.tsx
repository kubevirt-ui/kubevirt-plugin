import React from 'react';

import { CustomWizardNavItemFunction } from '@patternfly/react-core';
import VMGenerationWizardNavItem from '@virtualmachines/creation-wizard-new/components/VMGenerationWizardNavItem/VMGenerationWizardNavItem';

import { WizardStepNavItemConfig } from './types';

export const getVMGenerationNavItem =
  (navItemConfig: WizardStepNavItemConfig): CustomWizardNavItemFunction =>
  (step, activeStep, _steps, goToStepByIndex) => (
    <VMGenerationWizardNavItem
      activeStep={activeStep}
      goToStepByIndex={goToStepByIndex}
      handleNavItemClick={navItemConfig.handleNavItemClick}
      isGeneratingVM={navItemConfig.isGeneratingVM}
      step={step}
    />
  );
