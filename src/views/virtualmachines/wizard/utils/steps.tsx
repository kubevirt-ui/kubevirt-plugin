import React from 'react';

import { type CustomWizardNavItemFunction } from '@patternfly/react-core';
import VMGenerationWizardNavItem from '@virtualmachines/wizard/components/VMGenerationWizardNavItem/VMGenerationWizardNavItem';

import { type WizardStepNavItemConfig } from './types';

export const getVMGenerationNavItem =
  (navItemConfig: WizardStepNavItemConfig): CustomWizardNavItemFunction =>
  (step, activeStep, _steps, goToStepByIndex) => (
    <VMGenerationWizardNavItem
      activeStep={activeStep}
      goToStepByIndex={goToStepByIndex}
      handleNavItemClick={navItemConfig.handleNavItemClick}
      isGeneratingVM={navItemConfig.isGeneratingVM}
      loaded={navItemConfig.loaded}
      step={step}
    />
  );
