import React, { FC } from 'react';

import { Switch, Tooltip } from '@patternfly/react-core';

type SwitchWithTooltipProps = {
  ariaLabel?: string;
  dataTestID?: string;
  disabledTooltipContent: string;
  onSwitchChange: (newSwitchState: boolean) => void;
  switchIsDisabled?: boolean;
  switchState: boolean;
};

const SwitchWithTooltip: FC<SwitchWithTooltipProps> = ({
  ariaLabel,
  dataTestID,
  disabledTooltipContent,
  onSwitchChange,
  switchIsDisabled,
  switchState,
}) =>
  switchIsDisabled ? (
    <Tooltip content={disabledTooltipContent}>
      <Switch
        aria-label={ariaLabel}
        data-test-id={dataTestID}
        isChecked={switchState}
        isDisabled={switchIsDisabled}
        onChange={(_, checked: boolean) => onSwitchChange(checked)}
      />
    </Tooltip>
  ) : (
    <Switch
      aria-label={ariaLabel}
      data-test-id={dataTestID}
      isChecked={switchState}
      onChange={(_, checked: boolean) => onSwitchChange(checked)}
    />
  );
export default SwitchWithTooltip;
