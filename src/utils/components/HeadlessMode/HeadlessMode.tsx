import React, { type FC, useState } from 'react';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { isHeadlessMode } from '@kubevirt-utils/resources/vm';
import { Switch } from '@patternfly/react-core';

type HeadlessModeProps = {
  updateHeadlessMode: (checked: boolean) => Promise<V1VirtualMachine>;
  vm: V1VirtualMachine;
};

const HeadlessMode: FC<HeadlessModeProps> = ({ updateHeadlessMode, vm }) => {
  const [isChecked, setIsChecked] = useState<boolean>(() => isHeadlessMode(vm));
  return (
    <Switch
      checked={isChecked}
      id="headless-mode"
      onChange={(_event, checked: boolean) => {
        setIsChecked(checked);
        void updateHeadlessMode(checked);
      }}
    />
  );
};

export default HeadlessMode;
