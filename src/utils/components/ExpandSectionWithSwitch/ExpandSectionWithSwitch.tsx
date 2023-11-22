import React, { FC, FormEvent, ReactNode } from 'react';

import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { PopoverPosition, Split, SplitItem, Switch } from '@patternfly/react-core';

import ExpandSection from '../../../views/clusteroverview/SettingsTab/ExpandSection/ExpandSection';
import NewBadge from '../NewBadge/NewBadge';

import './ExpandSectionWithSwitch.scss';

type ExpandSectionWithSwitchProps = {
  children: ReactNode;
  helpTextIconContent?: ReactNode;
  isDisabled?: boolean;
  newBadge: boolean;
  switchIsOn: boolean;
  toggleContent?: ReactNode;
  toggleText?: string;
  turnOnSwitch: (checked: boolean, event: FormEvent<HTMLInputElement>) => void;
};

const ExpandSectionWithSwitch: FC<ExpandSectionWithSwitchProps> = ({
  children,
  helpTextIconContent,
  isDisabled,
  newBadge = false,
  switchIsOn,
  toggleContent,
  toggleText,
  turnOnSwitch,
}) => (
  <Split className="expand-section-with-switch">
    <SplitItem>
      <ExpandSection isDisabled={isDisabled} toggleContent={toggleContent} toggleText={toggleText}>
        <div className="expand-section-with-switch__contents">{children}</div>
      </ExpandSection>
    </SplitItem>
    {helpTextIconContent && (
      <SplitItem isFilled>
        <HelpTextIcon
          bodyContent={helpTextIconContent}
          className="expand-section-with-switch__help-text-popover"
          helpIconClassName="expand-section-with-switch__help-icon"
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

export default ExpandSectionWithSwitch;
