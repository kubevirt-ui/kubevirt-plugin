import React, { FC, ReactNode } from 'react';

import ExpandSectionWithCustomToggle from '@kubevirt-utils/components/ExpandSectionWithCustomToggle/ExpandSectionWithCustomToggle';
import { Switch } from '@patternfly/react-core';

import './ExpandSectionWithSwitch.scss';

type ExpandSectionWithSwitchProps = {
  children: ReactNode;
  helpTextContent?: ReactNode;
  id: string;
  isDisabled?: boolean;
  switchState: boolean;
  toggleContent: ReactNode;
  toggleSwitch: (checked: boolean) => void;
};

const ExpandSectionWithSwitch: FC<ExpandSectionWithSwitchProps> = ({
  children,
  helpTextContent,
  id,
  isDisabled,
  switchState,
  toggleContent,
  toggleSwitch,
}) => (
  <ExpandSectionWithCustomToggle
    customContent={
      <div className="expand-section-with-switch__switch-container">
        <Switch
          isChecked={switchState}
          isDisabled={isDisabled}
          onChange={(_, checked: boolean) => toggleSwitch(checked)}
        />
      </div>
    }
    helpTextContent={helpTextContent}
    id={id}
    toggleContent={toggleContent}
  >
    {children}
  </ExpandSectionWithCustomToggle>
);

export default ExpandSectionWithSwitch;
