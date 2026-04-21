import React, { FC, ReactNode, useCallback, useEffect } from 'react';

import {
  runningTourSignal,
  tourStepsSeenSignal,
  welcomeModalDismissedSignal,
} from '@kubevirt-utils/components/GuidedTour/utils/guidedTourSignals';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtUserSettings from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettings';
import { Button, ButtonVariant, Popover, PopoverPosition } from '@patternfly/react-core';
import { useSignals } from '@preact/signals-react/runtime';

import { ONBOARDING_POPOVER_CHAIN } from './constants';
import { dismissedPopoverKeysSignal } from './onboardingSignals';
import { OnboardingPopoverKey } from './types';

type OnboardingPopoverProps = {
  bodyContent: ReactNode;
  coveredByTourSteps?: number[];
  headerContent: ReactNode;
  hideOnTriggerClick?: boolean;
  popoverKey: OnboardingPopoverKey;
  triggerElement: HTMLElement | null;
};

const OnboardingPopover: FC<OnboardingPopoverProps> = ({
  bodyContent,
  coveredByTourSteps,
  headerContent,
  hideOnTriggerClick = false,
  popoverKey,
  triggerElement,
}) => {
  useSignals();
  const { t } = useKubevirtTranslation();
  const [userSettings, setUserSettings, userSettingsLoaded] = useKubevirtUserSettings();
  const onboardingPopoversHidden = userSettings?.onboardingPopoversHidden;
  const quickStarts = userSettings?.quickStart;
  const chainIndex = ONBOARDING_POPOVER_CHAIN.indexOf(popoverKey);
  const predecessorsDismissed =
    chainIndex === -1 ||
    ONBOARDING_POPOVER_CHAIN.slice(0, chainIndex).every(
      (key) => onboardingPopoversHidden?.[key] || dismissedPopoverKeysSignal.value.has(key),
    );

  const tourStepsSeen = [...(quickStarts?.tourStepsSeen || []), ...tourStepsSeenSignal.value];
  const coveredByTour = coveredByTourSteps?.some((step) => tourStepsSeen.includes(step)) ?? false;

  const hide = useCallback(() => {
    dismissedPopoverKeysSignal.value = new Set([...dismissedPopoverKeysSignal.value, popoverKey]);
    setUserSettings({
      ...userSettings,
      onboardingPopoversHidden: { ...onboardingPopoversHidden, [popoverKey]: true },
    });
  }, [onboardingPopoversHidden, popoverKey, setUserSettings, userSettings]);

  useEffect(() => {
    if (coveredByTour && !dismissedPopoverKeysSignal.value.has(popoverKey)) {
      hide();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coveredByTour]);

  const welcomeExperienceDone =
    welcomeModalDismissedSignal.value || !!quickStarts?.dontShowWelcomeModal;

  const isVisible =
    userSettingsLoaded &&
    !dismissedPopoverKeysSignal.value.has(popoverKey) &&
    !onboardingPopoversHidden?.[popoverKey] &&
    predecessorsDismissed &&
    !coveredByTour &&
    !runningTourSignal.value &&
    welcomeExperienceDone &&
    !!triggerElement;

  const handleClose = (event: KeyboardEvent | MouseEvent) => {
    // if user clicks the trigger element, don't hide the popover (unless hideOnTriggerClick is true)
    if (!hideOnTriggerClick && event instanceof MouseEvent) {
      if (triggerElement?.contains(event.target as Node)) return;
    }
    hide();
  };

  return (
    <Popover
      footerContent={
        <Button onClick={hide} variant={ButtonVariant.link}>
          {t('Got it')}
        </Button>
      }
      bodyContent={bodyContent}
      headerContent={headerContent}
      hideOnOutsideClick={false}
      isVisible={isVisible}
      position={PopoverPosition.right}
      shouldClose={handleClose}
      showClose
      triggerRef={() => triggerElement as HTMLElement}
    />
  );
};

export default OnboardingPopover;
