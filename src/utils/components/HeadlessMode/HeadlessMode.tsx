import React, { FC, useState } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { isHeadlessMode } from '@kubevirt-utils/resources/vm';
import { Switch } from '@patternfly/react-core';

type HeadlessModeProps = {
  updateHeadlessMode: (checked: boolean) => Promise<V1VirtualMachine>;
  vm: V1VirtualMachine;
};

const HeadlessMode: FC<HeadlessModeProps> = ({ updateHeadlessMode, vm }) => {
  const [isChecked, setIsChecked] = useState<boolean>(isHeadlessMode(vm));
  return (
    <Switch
      onChange={(_event, checked: boolean) => {
        setIsChecked(checked);
        updateHeadlessMode(checked);
      }}
      checked={isChecked}
      id="headless-mode"
    />
  );
};

export default HeadlessMode;
