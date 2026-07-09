import React, { FC } from 'react';

import { WizardNavItem, WizardStepType } from '@patternfly/react-core';
import { VMGenerationNavItemClickHandler } from '@virtualmachines/wizard/utils/types';

type VMGenerationWizardNavItemProps = {
  activeStep: WizardStepType;
  goToStepByIndex: (index: number) => void;
  handleNavItemClick: VMGenerationNavItemClickHandler;
  isGeneratingVM: boolean;
  step: WizardStepType;
};

const VMGenerationWizardNavItem: FC<VMGenerationWizardNavItemProps> = ({
  activeStep,
  goToStepByIndex,
  handleNavItemClick,
  isGeneratingVM,
  step,
}) => (
  <WizardNavItem
    content={step.name}
    id={step.id}
    isCurrent={step.id === activeStep?.id}
    isDisabled={step.isDisabled || isGeneratingVM}
    onClick={() => handleNavItemClick(step, activeStep, goToStepByIndex)}
    stepIndex={step.index}
  />
);

export default VMGenerationWizardNavItem;
