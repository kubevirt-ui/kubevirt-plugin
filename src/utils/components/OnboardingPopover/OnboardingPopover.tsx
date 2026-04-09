import React, { FC, ReactNode, useRef, useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtUserSettings from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettings';
import { Button, ButtonVariant, Popover, PopoverPosition } from '@patternfly/react-core';

import { ONBOARDING_POPOVER_CHAIN } from './constants';
import { OnboardingPopoverKey } from './types';

type OnboardingPopoverProps = {
  bodyContent: ReactNode;
  headerContent: ReactNode;
  hideOnTriggerClick?: boolean;
  popoverKey: OnboardingPopoverKey;
  triggerElement?: HTMLElement;
};

const OnboardingPopover: FC<OnboardingPopoverProps> = ({
  bodyContent,
  children,
  headerContent,
  hideOnTriggerClick = false,
  popoverKey,
  triggerElement,
}) => {
  const { t } = useKubevirtTranslation();
  const [onboardingPopoversHidden, setOnboardingPopoversHidden, userSettingsLoaded] =
    useKubevirtUserSettings('onboardingPopoversHidden');
  const [isHidden, setIsHidden] = useState(false);
  const spanRef = useRef<HTMLSpanElement>(null);

  const triggerRef = triggerElement ? () => triggerElement : spanRef;

  const chainIndex = ONBOARDING_POPOVER_CHAIN.indexOf(popoverKey);
  const predecessorsDismissed = ONBOARDING_POPOVER_CHAIN.slice(0, chainIndex).every(
    (key) => onboardingPopoversHidden?.[key],
  );

  const isVisible =
    userSettingsLoaded &&
    !isHidden &&
    !onboardingPopoversHidden?.[popoverKey] &&
    predecessorsDismissed &&
    triggerElement !== null;

  const hide = () => {
    setIsHidden(true);
    setOnboardingPopoversHidden({ ...onboardingPopoversHidden, [popoverKey]: true });
  };

  const handleClose = (event: KeyboardEvent | MouseEvent) => {
    // if user clicks the trigger element, don't hide the popover (unless hideOnTriggerClick is true)
    if (!hideOnTriggerClick && event instanceof MouseEvent) {
      const trigger = triggerElement ?? spanRef.current;
      if (trigger?.contains(event.target as Node)) return;
    }
    hide();
  };

  return (
    <>
      {!triggerElement && <span ref={spanRef}>{children}</span>}
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
        triggerRef={triggerRef}
      />
    </>
  );
};

export default OnboardingPopover;
