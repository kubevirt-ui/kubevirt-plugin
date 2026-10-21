import { type FC } from 'react';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import HidableTooltip from '@kubevirt-utils/components/HidableTooltip/HidableTooltip';
import { isVSOCKEnabled } from '@kubevirt-utils/resources/vm';
import { Switch } from '@patternfly/react-core';

type EnableVSOCKProps = {
  disabledTooltipText?: string;
  isDisabled?: boolean;
  updateVSOCK: (checked: boolean) => Promise<V1VirtualMachine | void>;
  vm: V1VirtualMachine;
};

const EnableVSOCK: FC<EnableVSOCKProps> = ({
  disabledTooltipText,
  isDisabled,
  updateVSOCK,
  vm,
}) => {
  const isChecked = isVSOCKEnabled(vm);

  return (
    <HidableTooltip content={disabledTooltipText} hidden={!isDisabled || !disabledTooltipText}>
      <Switch
        checked={isChecked}
        id="enable-vsock"
        isDisabled={isDisabled}
        onChange={(_event, checked: boolean) => {
          void updateVSOCK(checked);
        }}
      />
    </HidableTooltip>
  );
};

export default EnableVSOCK;
