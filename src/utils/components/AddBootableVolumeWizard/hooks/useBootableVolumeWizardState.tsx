import {
  createContext,
  type FC,
  type PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

import {
  BOOTABLE_VOLUME_WIZARD_STEPS,
  type BootableVolumeWizardStep,
} from '../form/stepValidation';

type BootableVolumeWizardNavigationState = {
  currentStep: BootableVolumeWizardStep;
  visitedSteps: Set<BootableVolumeWizardStep>;
};

type BootableVolumeWizardStateContextValue = BootableVolumeWizardNavigationState & {
  setCurrentStep: (step: BootableVolumeWizardStep) => void;
};

const BootableVolumeWizardStateContext = createContext<
  BootableVolumeWizardStateContextValue | undefined
>(undefined);

const createNavigationState = (): BootableVolumeWizardNavigationState => ({
  currentStep: BOOTABLE_VOLUME_WIZARD_STEPS[0],
  visitedSteps: new Set([BOOTABLE_VOLUME_WIZARD_STEPS[0]]),
});

const BootableVolumeWizardStateProvider: FC<PropsWithChildren> = ({ children }) => {
  const [navigation, setNavigation] = useState(createNavigationState);

  const setCurrentStep = useCallback((step: BootableVolumeWizardStep): void => {
    setNavigation((current) => ({
      ...current,
      currentStep: step,
      visitedSteps: current.visitedSteps.has(step)
        ? current.visitedSteps
        : new Set(current.visitedSteps).add(step),
    }));
  }, []);

  const value = useMemo(
    () => ({
      ...navigation,
      setCurrentStep,
    }),
    [navigation, setCurrentStep],
  );

  return (
    <BootableVolumeWizardStateContext.Provider value={value}>
      {children}
    </BootableVolumeWizardStateContext.Provider>
  );
};

export const useBootableVolumeWizardState = (): BootableVolumeWizardStateContextValue => {
  const context = useContext(BootableVolumeWizardStateContext);

  if (!context) {
    throw new Error(
      'useBootableVolumeWizardState must be used within BootableVolumeWizardStateProvider',
    );
  }

  return context;
};

export default BootableVolumeWizardStateProvider;
