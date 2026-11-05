import { type FC, type PropsWithChildren, useCallback, useMemo, useRef, useState } from 'react';

import { VMWizardStep } from '../utils/constants';
import { type VMWizardNavigationState } from './types';
import { VMWizardStateContext } from './useVMWizardState';

const createNavigationState = (): VMWizardNavigationState => ({
  currentStep: VMWizardStep.DEPLOYMENT_DETAILS,
  visitedSteps: new Set([VMWizardStep.DEPLOYMENT_DETAILS]),
});

const VMWizardStateProvider: FC<PropsWithChildren> = ({ children }) => {
  const [navigation, setNavigation] = useState(createNavigationState);
  const [isTemplateDrawerOpen, setIsTemplateDrawerOpen] = useState(false);
  const [templateProcessError, setTemplateProcessError] = useState<null | string>(null);
  const templateGenerationRevisionRef = useRef(0);
  const getTemplateGenerationRevision = useCallback(
    () => templateGenerationRevisionRef.current,
    [],
  );
  const invalidateTemplateGeneration = useCallback(() => {
    templateGenerationRevisionRef.current += 1;
  }, []);

  const setCurrentStep = useCallback((step: string): void => {
    setNavigation((current) => ({
      ...current,
      currentStep: step,
      visitedSteps: current.visitedSteps.has(step)
        ? current.visitedSteps
        : new Set(current.visitedSteps).add(step),
    }));
  }, []);

  const resetState = useCallback((): void => {
    templateGenerationRevisionRef.current = 0;
    setNavigation(createNavigationState());
    setIsTemplateDrawerOpen(false);
    setTemplateProcessError(null);
  }, []);

  const value = useMemo(
    () => ({
      ...navigation,
      getTemplateGenerationRevision,
      invalidateTemplateGeneration,
      isTemplateDrawerOpen,
      resetState,
      setCurrentStep,
      setIsTemplateDrawerOpen,
      setTemplateProcessError,
      templateProcessError,
    }),
    [
      navigation,
      getTemplateGenerationRevision,
      invalidateTemplateGeneration,
      isTemplateDrawerOpen,
      resetState,
      setCurrentStep,
      templateProcessError,
    ],
  );

  return <VMWizardStateContext.Provider value={value}>{children}</VMWizardStateContext.Provider>;
};

export default VMWizardStateProvider;
