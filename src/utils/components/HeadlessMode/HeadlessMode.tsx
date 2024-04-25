import React, { FC, useState } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { Switch } from '@patternfly/react-core';

type HeadlessModeProps = {
  updateHeadlessMode: (checked: boolean) => Promise<V1VirtualMachine>;
  vm: V1VirtualMachine;
};

const HeadlessMode: FC<HeadlessModeProps> = ({ updateHeadlessMode, vm }) => {
  const devices = vm?.spec?.template?.spec?.domain?.devices;
  const [isChecked, setIsChecked] = useState<boolean>(
    devices?.hasOwnProperty('autoattachGraphicsDevice') &&
      devices?.autoattachGraphicsDevice === false,
  );
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
