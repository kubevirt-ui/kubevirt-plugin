import { type FC, type PropsWithChildren, useCallback, useMemo, useState } from 'react';

import { VMWizardStep } from '../utils/constants';
import { type VMWizardNavigationState } from './types';
import { VMWizardStateContext } from './useVMWizardState';

const createNavigationState = (): VMWizardNavigationState => ({
  currentStep: VMWizardStep.DEPLOYMENT_DETAILS,
  strictVMName: false,
  visitedSteps: new Set([VMWizardStep.DEPLOYMENT_DETAILS]),
});

const VMWizardStateProvider: FC<PropsWithChildren> = ({ children }) => {
  const [navigation, setNavigation] = useState(createNavigationState);
  const [isTemplateDrawerOpen, setIsTemplateDrawerOpen] = useState(false);
  const [templateProcessError, setTemplateProcessError] = useState<null | string>(null);

  const setCurrentStep = useCallback((step: string): void => {
    setNavigation((current) => ({
      ...current,
      currentStep: step,
      visitedSteps: current.visitedSteps.has(step)
        ? current.visitedSteps
        : new Set(current.visitedSteps).add(step),
    }));
  }, []);

  const setStrictVMName = useCallback((strictVMName: boolean): void => {
    setNavigation((current) => ({ ...current, strictVMName }));
  }, []);

  const resetState = useCallback((): void => {
    setNavigation(createNavigationState());
    setIsTemplateDrawerOpen(false);
    setTemplateProcessError(null);
  }, []);

  const value = useMemo(
    () => ({
      ...navigation,
      isTemplateDrawerOpen,
      resetState,
      setCurrentStep,
      setIsTemplateDrawerOpen,
      setStrictVMName,
      setTemplateProcessError,
      templateProcessError,
    }),
    [
      navigation,
      isTemplateDrawerOpen,
      resetState,
      setCurrentStep,
      setStrictVMName,
      templateProcessError,
    ],
  );

  return <VMWizardStateContext.Provider value={value}>{children}</VMWizardStateContext.Provider>;
};

export default VMWizardStateProvider;
