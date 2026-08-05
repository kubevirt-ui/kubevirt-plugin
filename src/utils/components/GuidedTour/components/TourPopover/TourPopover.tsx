import React, { type FC, type MouseEventHandler } from 'react';
import { type TooltipRenderProps } from 'react-joyride';
import classNames from 'classnames';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button, ButtonVariant, Split, SplitItem } from '@patternfly/react-core';
import { CloseIcon } from '@patternfly/react-icons';
import popoverStyles from '@patternfly/react-styles/css/components/Popover/popover';

import EndTourFooter from '../EndTourFooter/EndTourFooter';

import './TourPopover.scss';

const TourPopover: FC<TooltipRenderProps> = ({
  backProps,
  closeProps,
  index,
  isLastStep,
  primaryProps,
  size,
  step,
}) => {
  const { t } = useKubevirtTranslation();
  return (
    <div className={classNames(popoverStyles.popover, 'kv-tour-popover')} data-test="tour-popover">
      <Split>
        {step.title && (
          <SplitItem className="kv-tour-popover__header" data-test="tour-popover-header">
            {step.title}
          </SplitItem>
        )}
        <SplitItem isFilled />
        <SplitItem>
          <Button
            aria-label={t('Close')}
            className="pf-v6-c-popover__close"
            data-action="close"
            icon={<CloseIcon />}
            onClick={closeProps.onClick as MouseEventHandler<HTMLButtonElement>}
            variant={ButtonVariant.plain}
          />
        </SplitItem>
      </Split>
      <div className={classNames(popoverStyles.popoverContent)}>{step.content}</div>
      <Split className="kv-tour-popover__buttons-footer" hasGutter>
        <SplitItem className="kv-tour-popover__step-counter" data-test="tour-step-counter">
          {t('Step {{current}}/{{size}}', { current: index + 1, size })}
        </SplitItem>
        <SplitItem isFilled />
        {index > 0 && (
          <SplitItem>
            <Button
              {...backProps}
              className="kv-tour-popover__next"
              data-test="tour-back-btn"
              variant={ButtonVariant.secondary}
            >
              {t('Back')}
            </Button>
          </SplitItem>
        )}
        <SplitItem>
          <Button
            {...primaryProps}
            className="kv-tour-popover__previous"
            data-test="tour-next-btn"
            variant={ButtonVariant.primary}
          >
            {isLastStep ? t('Okay, got it!') : t('Next')}
          </Button>
        </SplitItem>
      </Split>
      {isLastStep && <EndTourFooter />}
    </div>
  );
};

export default TourPopover;
