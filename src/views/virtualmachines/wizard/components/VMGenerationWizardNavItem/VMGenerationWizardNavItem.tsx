import React, { type FC } from 'react';

import { WizardNavItem, type WizardStepType } from '@patternfly/react-core';
import { type VMGenerationNavItemClickHandler } from '@virtualmachines/wizard/utils/types';

type VMGenerationWizardNavItemProps = {
  activeStep: WizardStepType;
  goToStepByIndex: (index: number) => void;
  handleNavItemClick: VMGenerationNavItemClickHandler;
  isGeneratingVM: boolean;
  loaded: boolean;
  step: WizardStepType;
};

const VMGenerationWizardNavItem: FC<VMGenerationWizardNavItemProps> = ({
  activeStep,
  goToStepByIndex,
  handleNavItemClick,
  isGeneratingVM,
  loaded = true,
  step,
}) => (
  <WizardNavItem
    content={step.name}
    id={step.id}
    isCurrent={step.id === activeStep?.id}
    isDisabled={step.isDisabled || isGeneratingVM || !loaded}
    onClick={() => handleNavItemClick(step, activeStep, goToStepByIndex)}
    stepIndex={step.index}
  />
);

export default VMGenerationWizardNavItem;
