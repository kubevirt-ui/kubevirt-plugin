import React, { FC } from 'react';
import { TooltipRenderProps } from 'react-joyride';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button, ButtonVariant, Split, SplitItem } from '@patternfly/react-core';
import { CloseIcon } from '@patternfly/react-icons';
import { css } from '@patternfly/react-styles';
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
    <div className={css(popoverStyles.popover, 'kv-tour-popover')}>
      <Split>
        {step.title && <SplitItem className="kv-tour-popover__header">{step.title}</SplitItem>}
        <SplitItem isFilled />
        <SplitItem>
          <Button
            {...closeProps}
            className="pf-v5-c-popover__close"
            icon={<CloseIcon />}
            variant={ButtonVariant.plain}
          />
        </SplitItem>
      </Split>
      <div className={css(popoverStyles.popoverContent)}>{step.content}</div>
      <Split className="kv-tour-popover__buttons-footer" hasGutter>
        <SplitItem className="kv-tour-popover__step-counter">
          {t('Step {{current}}/{{size}}', { current: index + 1, size })}
        </SplitItem>
        <SplitItem isFilled />
        {index > 0 && (
          <SplitItem>
            <Button
              {...backProps}
              className="kv-tour-popover__next"
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
