import React, { FC, ReactNode } from 'react';
import classNames from 'classnames';

import NewBadge from '@kubevirt-utils/components/badges/NewBadge/NewBadge';
import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { PopoverPosition, Split, SplitItem, Switch } from '@patternfly/react-core';

import ExternalLink from '../ExternalLink/ExternalLink';

import './section-with-switch.scss';

type SectionWithSwitchProps = {
  dataTestID?: string;
  externalLink?: string;
  helpTextIconContent?: ((hide: () => void) => ReactNode) | ReactNode;
  id?: string;
  inlineCheckbox?: boolean;
  isDisabled?: boolean;
  isLoading?: boolean;
  maxWidth?: string;
  newBadge?: boolean;
  popoverClassName?: string;
  switchIsOn: boolean;
  title?: ReactNode;
  turnOnSwitch: (checked: boolean) => void;
};

const SectionWithSwitch: FC<SectionWithSwitchProps> = ({
  children,
  dataTestID,
  externalLink,
  helpTextIconContent = '',
  id,
  inlineCheckbox,
  isDisabled,
  isLoading,
  maxWidth,
  newBadge = false,
  popoverClassName,
  switchIsOn,
  title,
  turnOnSwitch,
}) => {
  const Wrapper = inlineCheckbox ? 'div' : Split;

  return (
    <Wrapper className="section-with-switch" hasGutter id={id} style={{ maxWidth }}>
      <div
        className={classNames('section-with-switch__text', {
          'section-with-switch__inline': inlineCheckbox,
        })}
      >
        {title}
        {externalLink && <ExternalLink href={externalLink} />}
        {helpTextIconContent && (
          <SplitItem isFilled>
            <HelpTextIcon
              bodyContent={helpTextIconContent}
              className={popoverClassName}
              helpIconClassName="section-with-switch__help-text-popover"
              position={PopoverPosition.right}
            />
            {newBadge && <NewBadge />}
          </SplitItem>
        )}
      </div>
      <SplitItem className={classNames({ 'section-with-switch__inline': inlineCheckbox })}>
        {children}{' '}
        <Switch
          className={isLoading && 'kv-cursor--loading'}
          data-test-id={dataTestID}
          isChecked={switchIsOn}
          isDisabled={isDisabled}
          onChange={(_, checked: boolean) => turnOnSwitch(checked)}
        />
      </SplitItem>
    </Wrapper>
  );
};

export default SectionWithSwitch;
