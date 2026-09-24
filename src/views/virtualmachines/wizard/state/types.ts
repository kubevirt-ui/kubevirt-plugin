import { type Dispatch, type SetStateAction } from 'react';

export type VMWizardNavigationState = {
  currentStep: string;
  strictVMName: boolean;
  visitedSteps: Set<string>;
};

export type VMWizardState = VMWizardNavigationState & {
  isTemplateDrawerOpen: boolean;
  templateProcessError: null | string;
};

export type VMWizardStateContextValue = VMWizardState & {
  resetState: () => void;
  setCurrentStep: (step: string) => void;
  setIsTemplateDrawerOpen: Dispatch<SetStateAction<boolean>>;
  setStrictVMName: (strict: boolean) => void;
  setTemplateProcessError: Dispatch<SetStateAction<null | string>>;
};
