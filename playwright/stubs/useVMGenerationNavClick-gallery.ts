import type { WizardStepNavItemConfig } from '@virtualmachines/wizard/utils/types';

const useVMGenerationNavClick = (): WizardStepNavItemConfig => ({
  handleNavItemClick: async (_step, _activeStep, goToStepByIndex) => {
    goToStepByIndex(_step.index);
  },
  isGeneratingVM: false,
  loaded: true,
});

export default useVMGenerationNavClick;
