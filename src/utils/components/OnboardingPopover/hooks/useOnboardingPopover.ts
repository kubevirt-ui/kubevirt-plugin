import { useCallback } from 'react';

import useKubevirtUserSettings from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettings';

import { useSignals } from '@preact/signals-react/runtime';
import { dismissedPopoverKeysSignal } from '../onboardingSignals';
import { OnboardingPopoverKey } from '../types';
import { getTourStepsSeen, isCoveredByTourSteps, isPopoverVisible } from '../utils';

type UseOnboardingPopoverArgs = {
  coveredByTourSteps?: number[];
  popoverKey: OnboardingPopoverKey;
  triggerElement: HTMLElement | null;
};

type UseOnboardingPopoverReturn = {
  dismiss: () => void;
  isVisible: boolean;
};

const useOnboardingPopover = ({
  coveredByTourSteps,
  popoverKey,
  triggerElement,
}: UseOnboardingPopoverArgs): UseOnboardingPopoverReturn => {
  useSignals();
  const [userSettings, setUserSettings, userSettingsLoaded] = useKubevirtUserSettings();
  const onboardingPopoversHidden = userSettings?.onboardingPopoversHidden;

  const tourStepsSeen = getTourStepsSeen(userSettings?.quickStart);
  const isCoveredByTour = isCoveredByTourSteps(coveredByTourSteps, tourStepsSeen);

  const isVisible = isPopoverVisible({
    isCoveredByTour,
    popoverKey,
    triggerElement,
    userSettings,
    userSettingsLoaded,
  });

  const dismiss = useCallback(() => {
    dismissedPopoverKeysSignal.value = new Set([...dismissedPopoverKeysSignal.value, popoverKey]);
    setUserSettings({
      ...userSettings,
      onboardingPopoversHidden: { ...onboardingPopoversHidden, [popoverKey]: true },
    });
  }, [onboardingPopoversHidden, popoverKey, setUserSettings, userSettings]);

  return { dismiss, isVisible };
};

export default useOnboardingPopover;
