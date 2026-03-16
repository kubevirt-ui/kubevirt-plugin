import React, { FC } from 'react';

import { Switch, Tooltip } from '@patternfly/react-core';

type SwitchWithTooltipProps = {
  dataTestID?: string;
  disabledTooltipContent: string;
  onSwitchChange: (newSwitchState: boolean) => void;
  switchIsDisabled?: boolean;
  switchState: boolean;
};

const SwitchWithTooltip: FC<SwitchWithTooltipProps> = ({
  dataTestID,
  disabledTooltipContent,
  onSwitchChange,
  switchIsDisabled,
  switchState,
}) =>
  switchIsDisabled ? (
    <Tooltip content={disabledTooltipContent}>
      <Switch
        data-test-id={dataTestID}
        isChecked={switchState}
        isDisabled={switchIsDisabled}
        onChange={(_, checked: boolean) => onSwitchChange(checked)}
      />
    </Tooltip>
  ) : (
    <Switch
      data-test-id={dataTestID}
      isChecked={switchState}
      onChange={(_, checked: boolean) => onSwitchChange(checked)}
    />
  );
export default SwitchWithTooltip;
