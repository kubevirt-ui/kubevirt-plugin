import { type Dispatch, type SetStateAction } from 'react';

export type VMWizardNavigationState = {
  currentStep: string;
  strictVMName: boolean;
  visitedSteps: Set<string>;
};

export type VMWizardState = VMWizardNavigationState & {
  isCompleted: boolean;
  isTemplateDrawerOpen: boolean;
  templateProcessError: null | string;
};

export type VMWizardStateContextValue = VMWizardState & {
  allowNextWizardNavigation: () => void;
  consumeWizardNavigationAllowance: () => boolean;
  getTemplateGenerationRevision: () => number;
  invalidateTemplateGeneration: () => void;
  resetState: () => void;
  setCurrentStep: (step: string) => void;
  setIsCompleted: (completed: boolean) => void;
  setIsTemplateDrawerOpen: Dispatch<SetStateAction<boolean>>;
  setStrictVMName: (strict: boolean) => void;
  setTemplateProcessError: Dispatch<SetStateAction<null | string>>;
};
