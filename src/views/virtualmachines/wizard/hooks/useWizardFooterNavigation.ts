import { useWizardContext, type WizardStepType } from '@patternfly/react-core';
import { type VMWizardStep } from '@virtualmachines/wizard/utils/constants';
import { type WizardStepNavItemConfig } from '@virtualmachines/wizard/utils/types';

/** Footer buttons use the same destination checks and transition handler as sidebar items. */
const useWizardFooterNavigation = (
  navigation: WizardStepNavItemConfig,
): {
  activeStep: WizardStepType;
  isBackDisabled: boolean;
  isNextDisabled: boolean;
  onBack: () => void;
  onNext: () => void;
} => {
  const { activeStep, goToStepByIndex, steps } = useWizardContext();
  const currentIndex = steps.findIndex((step) => step.id === activeStep.id);
  const previous = steps[currentIndex - 1];
  const next = steps[currentIndex + 1];

  return {
    activeStep,
    isBackDisabled: Boolean(!previous || navigation.isStepDisabled(previous.id as VMWizardStep)),
    isNextDisabled: Boolean(!next || navigation.isStepDisabled(next.id as VMWizardStep)),
    onBack: (): void => {
      if (previous) void navigation.handleNavItemClick(previous, activeStep, goToStepByIndex);
    },
    onNext: (): void => {
      if (next) void navigation.handleNavItemClick(next, activeStep, goToStepByIndex);
    },
  };
};

export default useWizardFooterNavigation;
