import React, { FC } from 'react';

import { Switch, Tooltip } from '@patternfly/react-core';

type EnhancedSwitchProps = {
  disabledTooltipContent: string;
  onSwitchChange: (newSwitchState: boolean) => void;
  switchIsDisabled: boolean;
  switchState: boolean;
};

const EnhancedSwitch: FC<EnhancedSwitchProps> = ({
  disabledTooltipContent,
  onSwitchChange,
  switchIsDisabled,
  switchState,
}) =>
  switchIsDisabled ? (
    <Tooltip content={disabledTooltipContent}>
      <Switch
        isChecked={switchState}
        isDisabled={switchIsDisabled}
        onChange={(_, checked: boolean) => onSwitchChange(checked)}
      />
    </Tooltip>
  ) : (
    <Switch isChecked={switchState} onChange={(_, checked: boolean) => onSwitchChange(checked)} />
  );
export default EnhancedSwitch;
