import {
  dismissOnboardingPopoverByWelcomeModalSignal,
  runningTourSignal,
  tourStepsSeenSignal,
} from '@kubevirt-utils/components/GuidedTour/utils/guidedTourSignals';
import type { UserSettingsState } from '@kubevirt-utils/hooks/useKubevirtUserSettings/utils/userSettingsInitialState';

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
  popoverKey: OnboardingPopoverKey;
  triggerElement: HTMLElement | null;
  userSettings: Partial<UserSettingsState> | undefined;
  userSettingsError: Error | undefined;
  userSettingsLoaded: boolean;
};

export const isPopoverVisible = ({
  isCoveredByTour,
  popoverKey,
  triggerElement,
  userSettings,
  userSettingsError,
  userSettingsLoaded,
}: IsPopoverVisibleArgs): boolean => {
  if (userSettingsError) return false;

  const onboardingPopoversHidden = userSettings?.onboardingPopoversHidden;

  if (
    dismissedPopoverKeysSignal.value.has(popoverKey) ||
    !!onboardingPopoversHidden?.[popoverKey]
  ) {
    return false;
  }

  const shouldDismissOnboardingByWelcomeModal =
    dismissOnboardingPopoverByWelcomeModalSignal.value ||
    userSettings?.quickStart?.dontShowWelcomeModal;

  if (!userSettingsLoaded || !triggerElement || shouldDismissOnboardingByWelcomeModal) return false;

  if (isCoveredByTour || runningTourSignal.value) return false;

  return arePredecessorPopoversDismissed(
    popoverKey,
    onboardingPopoversHidden,
    dismissedPopoverKeysSignal.value,
  );
};
