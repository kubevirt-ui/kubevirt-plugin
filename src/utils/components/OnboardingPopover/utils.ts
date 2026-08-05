import {
  dismissOnboardingPopoverByWelcomeModalSignal,
  runningTourSignal,
  tourStepsSeenSignal,
} from '@kubevirt-utils/components/GuidedTour/utils/guidedTourSignals';
import type { UserSettingsState } from '@kubevirt-utils/hooks/useKubevirtUserSettings/utils/userSettingsInitialState';

import { ONBOARDING_POPOVER_CHAIN } from './constants';
import { dismissedPopoverKeysSignal } from './onboardingSignals';
import { OnboardingPopoverKey, OnboardingPopoversHidden } from './types';

export const arePredecessorPopoversDismissed = (
  popoverKey: OnboardingPopoverKey,
  onboardingPopoversHidden: OnboardingPopoversHidden | undefined,
  dismissedKeys: Set<OnboardingPopoverKey>,
): boolean => {
  const chainIndex = ONBOARDING_POPOVER_CHAIN.indexOf(popoverKey);
  const isPopoverNotInChain = chainIndex === -1;

  return (
    isPopoverNotInChain ||
    ONBOARDING_POPOVER_CHAIN.slice(0, chainIndex).every(
      (key) => onboardingPopoversHidden?.[key] || dismissedKeys.has(key),
    )
  );
};

export const isCoveredByTourSteps = (
  coveredByTourSteps: number[] | undefined,
  tourStepsSeen: number[],
): boolean => coveredByTourSteps?.some((step) => tourStepsSeen.includes(step)) ?? false;

export const getTourStepsSeen = (
  quickStart: { tourStepsSeen?: number[] } | undefined,
): number[] => [...(quickStart?.tourStepsSeen || []), ...tourStepsSeenSignal.value];

type IsPopoverVisibleArgs = {
  isCoveredByTour: boolean;
  popoverKey: OnboardingPopoverKey;
  triggerElement: HTMLElement | null;
  userSettings: Partial<UserSettingsState> | undefined;
  userSettingsLoaded: boolean;
};

export const isPopoverVisible = ({
  isCoveredByTour,
  popoverKey,
  triggerElement,
  userSettings,
  userSettingsLoaded,
}: IsPopoverVisibleArgs): boolean => {
  const onboardingPopoversHidden = userSettings?.onboardingPopoversHidden;
  const quickStart = userSettings?.quickStart;

  const shouldDismissOnboardingByWelcomeModal =
    dismissOnboardingPopoverByWelcomeModalSignal.value || quickStart?.dontShowWelcomeModal;

  if (!userSettingsLoaded || !triggerElement || shouldDismissOnboardingByWelcomeModal) return false;

  const isAlreadyDismissed =
    dismissedPopoverKeysSignal.value.has(popoverKey) || !!onboardingPopoversHidden?.[popoverKey];

  const predecessorPopoversDismissed = arePredecessorPopoversDismissed(
    popoverKey,
    onboardingPopoversHidden,
    dismissedPopoverKeysSignal.value,
  );

  const isVisible =
    !isAlreadyDismissed &&
    predecessorPopoversDismissed &&
    !isCoveredByTour &&
    !runningTourSignal.value;

  return isVisible;
};
