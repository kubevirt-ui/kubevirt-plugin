import React, { FC } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import useDeschedulerSetting from '@kubevirt-utils/hooks/useDeschedulerSetting/useDeschedulerSetting';
import { Switch } from '@patternfly/react-core';

type DeschedulerProps = {
  vm: V1VirtualMachine;
};

const Descheduler: FC<DeschedulerProps> = ({ vm }) => {
  const { deschedulerEnabled, deschedulerSwitchDisabled, onDeschedulerChange } =
    useDeschedulerSetting(vm);

  return (
    <>
      <Switch
        id="descheduler-switch"
        isChecked={deschedulerEnabled}
        isDisabled={deschedulerSwitchDisabled}
        onChange={(_event, checked) => onDeschedulerChange(checked)}
      />
    </>
  );
};

export default Descheduler;
