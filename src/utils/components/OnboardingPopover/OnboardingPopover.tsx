import React, { type FC, type ReactNode } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button, ButtonVariant, Popover, PopoverPosition } from '@patternfly/react-core';

import useOnboardingPopover from './hooks/useOnboardingPopover';
import { type OnboardingPopoverKey } from './types';

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
  const { t } = useKubevirtTranslation();
  const { dismiss, isVisible } = useOnboardingPopover({
    coveredByTourSteps,
    popoverKey,
    triggerElement,
  });

  const handleClose = (event: KeyboardEvent | MouseEvent): void => {
    const isMouseClick = event instanceof MouseEvent;
    const isClickOnTriggerElement = isMouseClick && triggerElement?.contains(event.target as Node);
    const shouldDismissPopover = hideOnTriggerClick || !isClickOnTriggerElement;

    if (!shouldDismissPopover) {
      return;
    }
    dismiss();
  };

  return (
    <Popover
      bodyContent={bodyContent}
      data-test="onboarding-popover"
      footerContent={
        <Button data-test="onboarding-dismiss-btn" onClick={dismiss} variant={ButtonVariant.link}>
          {t('Got it')}
        </Button>
      }
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
