import type { FC } from 'react';

import HidableTooltip from '@kubevirt-utils/components/HidableTooltip/HidableTooltip';
import { Switch } from '@patternfly/react-core';

type EnablePanicDetectionProps = {
  disabledTooltipText?: string;
  isChecked: boolean;
  isDisabled?: boolean;
  onChange: (checked: boolean) => void;
  vmName: string;
};

const EnablePanicDetection: FC<EnablePanicDetectionProps> = ({
  disabledTooltipText,
  isChecked,
  isDisabled,
  onChange,
  vmName,
}) => (
  <HidableTooltip content={disabledTooltipText} hidden={!isDisabled || !disabledTooltipText}>
    <Switch
      data-test={`${vmName}-panic-detection-switch`}
      id={`${vmName}-panic-detection`}
      isChecked={isChecked}
      isDisabled={isDisabled}
      onChange={(_event, checked: boolean) => {
        onChange(checked);
      }}
    />
  </HidableTooltip>
);

export default EnablePanicDetection;
