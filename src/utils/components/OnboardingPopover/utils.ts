import {
  dismissOnboardingPopoverByWelcomeModalSignal,
  runningTourSignal,
  tourStepsSeenSignal,
} from '@kubevirt-utils/components/GuidedTour/utils/guidedTourSignals';
import { type QuickStartUserSettings } from '@kubevirt-utils/hooks/useKubevirtUserSettings/utils/userSettingsInitialState';

import { ONBOARDING_POPOVER_CHAIN } from './constants';
import { dismissedPopoverKeysSignal } from './onboardingSignals';
import { type OnboardingPopoverKey, type OnboardingPopoversHidden } from './types';

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
): number[] => [...(quickStart?.tourStepsSeen ?? []), ...tourStepsSeenSignal.value];

type IsPopoverVisibleArgs = {
  isCoveredByTour: boolean;
  onboardingPopoversHidden: OnboardingPopoversHidden | undefined;
  popoverKey: OnboardingPopoverKey;
  quickStart: QuickStartUserSettings | undefined;
  triggerElement: HTMLElement | null;
  userSettingsLoaded: boolean;
};

export const isPopoverVisible = ({
  isCoveredByTour,
  onboardingPopoversHidden,
  popoverKey,
  quickStart,
  triggerElement,
  userSettingsLoaded,
}: IsPopoverVisibleArgs): boolean => {
  if (
    dismissedPopoverKeysSignal.value.has(popoverKey) ||
    !!onboardingPopoversHidden?.[popoverKey]
  ) {
    return false;
  }

  const shouldDismissOnboardingByWelcomeModal =
    dismissOnboardingPopoverByWelcomeModalSignal.value || quickStart?.dontShowWelcomeModal;

  if (!userSettingsLoaded || !triggerElement || shouldDismissOnboardingByWelcomeModal) return false;

  if (isCoveredByTour || runningTourSignal.value) return false;

  return arePredecessorPopoversDismissed(
    popoverKey,
    onboardingPopoversHidden,
    dismissedPopoverKeysSignal.value,
  );
};
