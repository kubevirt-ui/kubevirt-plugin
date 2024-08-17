import React, { FC, ReactNode } from 'react';

import NewBadge from '@kubevirt-utils/components/badges/NewBadge/NewBadge';
import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { PopoverPosition, Split, SplitItem, Switch } from '@patternfly/react-core';

import ExpandSection from '../../../views/clusteroverview/SettingsTab/ExpandSection/ExpandSection';

import './ExpandSectionWithSwitch.scss';

type ExpandSectionWithSwitchProps = {
  children: ReactNode;
  helpTextIconContent?: ReactNode;
  id?: string;
  isDisabled?: boolean;
  newBadge: boolean;
  switchIsOn: boolean;
  toggleContent?: ReactNode;
  toggleText?: string;
  turnOnSwitch: (checked: boolean) => void;
};

const ExpandSectionWithSwitch: FC<ExpandSectionWithSwitchProps> = ({
  children,
  helpTextIconContent,
  id,
  isDisabled,
  newBadge = false,
  switchIsOn,
  toggleContent,
  toggleText,
  turnOnSwitch,
}) => (
  <Split className="expand-section-with-switch" id={id}>
    <SplitItem>
      <ExpandSection isDisabled={isDisabled} toggleContent={toggleContent} toggleText={toggleText}>
        {children}
      </ExpandSection>
    </SplitItem>
    {helpTextIconContent && (
      <SplitItem isFilled>
        <HelpTextIcon
          bodyContent={helpTextIconContent}
          helpIconClassName="expand-section-with-switch__help-icon"
          position={PopoverPosition.right}
        />
        {newBadge && <NewBadge />}
      </SplitItem>
    )}
    <SplitItem>
      <Switch
        isChecked={switchIsOn}
        isDisabled={isDisabled}
        onChange={(_, checked: boolean) => turnOnSwitch(checked)}
      />
    </SplitItem>
  </Split>
);

export default ExpandSectionWithSwitch;
