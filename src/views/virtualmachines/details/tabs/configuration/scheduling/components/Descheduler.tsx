import type { FC } from 'react';

import type { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import useDeschedulerSetting from '@kubevirt-utils/hooks/useDeschedulerSetting/useDeschedulerSetting';
import { Switch } from '@patternfly/react-core';

type DeschedulerProps = {
  isDisabled?: boolean;
  vm: V1VirtualMachine;
};

const Descheduler: FC<DeschedulerProps> = ({ isDisabled, vm }) => {
  const { deschedulerEnabled, deschedulerSwitchDisabled, onDeschedulerChange } =
    useDeschedulerSetting(vm);

  return (
    <Switch
      data-test="descheduler-edit"
      id="descheduler-switch"
      isChecked={deschedulerEnabled}
      isDisabled={isDisabled || deschedulerSwitchDisabled}
      onChange={(_event, checked) => onDeschedulerChange(checked)}
    />
  );
};

export default Descheduler;
