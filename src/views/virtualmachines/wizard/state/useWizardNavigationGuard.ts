import { createContext, useContext } from 'react';

export type WizardNavigationGuardContextValue = {
  blockWizardNavigation: () => void;
  completeWizardAndNavigate: (destinationUrl: string) => void;
};

export const WizardNavigationGuardContext = createContext<
  WizardNavigationGuardContextValue | undefined
>(undefined);

export const useWizardNavigationGuard = (): WizardNavigationGuardContextValue => {
  const context = useContext(WizardNavigationGuardContext);

  if (!context) {
    throw new Error('useWizardNavigationGuard must be used within WizardNavigationGuardProvider');
  }

  return context;
};
