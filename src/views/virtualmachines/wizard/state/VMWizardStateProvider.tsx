import { type FC, type PropsWithChildren, useCallback, useMemo, useRef, useState } from 'react';

import useNavigationAllowance from '../hooks/useNavigationAllowance';
import useWizardBeforeUnload from '../hooks/useWizardBeforeUnload';
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
  const [isCompleted, setIsCompleted] = useState(false);
  const { allowNextWizardNavigation, consumeWizardNavigationAllowance, navigationAllowedRef } =
    useNavigationAllowance();
  const [isTemplateDrawerOpen, setIsTemplateDrawerOpen] = useState(false);
  const [templateProcessError, setTemplateProcessError] = useState<null | string>(null);

  useWizardBeforeUnload(!isCompleted);
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

  const setStrictVMName = useCallback((strictVMName: boolean): void => {
    setNavigation((current) => ({ ...current, strictVMName }));
  }, []);

  const resetState = useCallback((): void => {
    templateGenerationRevisionRef.current = 0;
    navigationAllowedRef.current = false;
    setNavigation(createNavigationState());
    setIsCompleted(false);
    setIsTemplateDrawerOpen(false);
    setTemplateProcessError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(
    () => ({
      ...navigation,
      allowNextWizardNavigation,
      consumeWizardNavigationAllowance,
      getTemplateGenerationRevision,
      invalidateTemplateGeneration,
      isCompleted,
      isTemplateDrawerOpen,
      resetState,
      setCurrentStep,
      setIsCompleted,
      setIsTemplateDrawerOpen,
      setStrictVMName,
      setTemplateProcessError,
      templateProcessError,
    }),
    [
      navigation,
      allowNextWizardNavigation,
      consumeWizardNavigationAllowance,
      getTemplateGenerationRevision,
      invalidateTemplateGeneration,
      isCompleted,
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
