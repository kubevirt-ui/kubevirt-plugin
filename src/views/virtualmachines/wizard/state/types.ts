import { type Dispatch, type SetStateAction } from 'react';

export type VMWizardNavigationState = {
  currentStep: string;
  visitedSteps: Set<string>;
};

export type VMWizardState = VMWizardNavigationState & {
  isTemplateDrawerOpen: boolean;
  templateProcessError: null | string;
};

export type VMWizardStateContextValue = VMWizardState & {
  getTemplateGenerationRevision: () => number;
  invalidateTemplateGeneration: () => void;
  resetState: () => void;
  setCurrentStep: (step: string) => void;
  setIsTemplateDrawerOpen: Dispatch<SetStateAction<boolean>>;
  setTemplateProcessError: Dispatch<SetStateAction<null | string>>;
};
