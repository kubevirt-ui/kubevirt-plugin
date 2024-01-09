import React, { FC, FormEvent, ReactNode } from 'react';
import classNames from 'classnames';

import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { PopoverPosition, Split, SplitItem, Switch } from '@patternfly/react-core';

import ExternalLink from '../ExternalLink/ExternalLink';
import NewBadge from '../NewBadge/NewBadge';

import './section-with-switch.scss';

type SectionWithSwitchProps = {
  externalLink?: string;
  helpTextIconContent?: ReactNode;
  id?: string;
  inlineCheckbox?: boolean;
  isDisabled?: boolean;
  maxWidth?: string;
  newBadge?: boolean;
  switchIsOn: boolean;
  title?: ReactNode;
  turnOnSwitch: (checked: boolean, event: FormEvent<HTMLInputElement>) => void;
};
const SectionWithSwitch: FC<SectionWithSwitchProps> = ({
  children,
  externalLink,
  helpTextIconContent,
  id,
  inlineCheckbox,
  isDisabled,
  maxWidth,
  newBadge = false,
  switchIsOn,
  title,
  turnOnSwitch,
}) => {
  const Wrapper = inlineCheckbox ? 'div' : Split;
  return (
    <Wrapper className="section-with-switch" id={id} style={{ maxWidth }}>
      <div className="section-with-switch__text">
        {title}
        {externalLink && <ExternalLink href={externalLink} />}
        {helpTextIconContent && (
          <SplitItem isFilled>
            <HelpTextIcon
              bodyContent={helpTextIconContent}
              helpIconClassName="section-with-switch__help-text-popover"
              position={PopoverPosition.right}
            />
            {newBadge && <NewBadge />}
          </SplitItem>
        )}
      </div>
      <SplitItem className={classNames({ 'section-with-switch__inline': inlineCheckbox })}>
        {children} <Switch isChecked={switchIsOn} isDisabled={isDisabled} onChange={turnOnSwitch} />
      </SplitItem>
    </Wrapper>
  );
};

export default SectionWithSwitch;
