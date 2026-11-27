import { useCallback } from 'react';

import useKubevirtUserSettings from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettings';
import { USER_SETTINGS_KEYS } from '@kubevirt-utils/hooks/useKubevirtUserSettings/utils/const';
import { useSignals } from '@preact/signals-react/runtime';

import { dismissedPopoverKeysSignal } from '../onboardingSignals';
import { type OnboardingPopoverKey } from '../types';
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
  const [onboardingPopoversHidden, setOnboardingPopoversHidden, onboardingLoaded] =
    useKubevirtUserSettings(USER_SETTINGS_KEYS.onboardingPopoversHidden);
  const [quickStart, , quickStartLoaded] = useKubevirtUserSettings(USER_SETTINGS_KEYS.quickStart);

  const tourStepsSeen = getTourStepsSeen(quickStart);
  const isCoveredByTour = isCoveredByTourSteps(coveredByTourSteps, tourStepsSeen);

  const isVisible = isPopoverVisible({
    isCoveredByTour,
    onboardingPopoversHidden,
    popoverKey,
    quickStart,
    triggerElement,
    userSettingsLoaded: onboardingLoaded && quickStartLoaded,
  });

  const dismiss = useCallback(() => {
    dismissedPopoverKeysSignal.value = new Set([...dismissedPopoverKeysSignal.value, popoverKey]);
    setOnboardingPopoversHidden({ ...onboardingPopoversHidden, [popoverKey]: true });
  }, [onboardingPopoversHidden, popoverKey, setOnboardingPopoversHidden]);

  return { dismiss, isVisible };
};

export default useOnboardingPopover;
