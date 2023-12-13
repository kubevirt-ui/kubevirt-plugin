import React, { FC, FormEvent, ReactNode } from 'react';

import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { PopoverPosition, Split, SplitItem, Switch } from '@patternfly/react-core';

import NewBadge from '../NewBadge/NewBadge';

import './section-with-switch.scss';

type ExpandSectionWithSwitchProps = {
  helpTextIconContent?: ReactNode;
  id?: string;
  isDisabled?: boolean;
  newBadge: boolean;
  switchIsOn: boolean;
  title?: ReactNode;
  turnOnSwitch: (checked: boolean, event: FormEvent<HTMLInputElement>) => void;
};
const SectionWithSwitch: FC<ExpandSectionWithSwitchProps> = ({
  helpTextIconContent,
  id,
  isDisabled,
  newBadge = false,
  switchIsOn,
  title,
  turnOnSwitch,
}) => (
  <Split className="section-with-switch" id={id}>
    {title}
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
    <SplitItem>
      <Switch isChecked={switchIsOn} isDisabled={isDisabled} onChange={turnOnSwitch} />
    </SplitItem>
  </Split>
);

export default SectionWithSwitch;
