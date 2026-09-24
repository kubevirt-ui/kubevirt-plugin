import { createContext, useContext } from 'react';

import { type VMWizardStateContextValue } from './types';

export const VMWizardStateContext = createContext<VMWizardStateContextValue | undefined>(undefined);

export const useVMWizardState = (): VMWizardStateContextValue => {
  const state = useContext(VMWizardStateContext);

  if (!state) throw new Error('useVMWizardState must be used within VMWizardStateProvider');

  return state;
};
