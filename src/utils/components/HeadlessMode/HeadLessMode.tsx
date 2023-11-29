import React, { FC, useState } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { Switch } from '@patternfly/react-core';

type HeadLessModeProps = {
  updateHeadlessMode: (checked: boolean) => Promise<V1VirtualMachine>;
  vm: V1VirtualMachine;
};

const HeadLessMode: FC<HeadLessModeProps> = ({ updateHeadlessMode, vm }) => {
  const devices = vm?.spec?.template?.spec?.domain?.devices;
  const [isChecked, setIsChecked] = useState<boolean>(
    devices?.hasOwnProperty('autoattachGraphicsDevice') && !devices?.autoattachGraphicsDevice,
  );
  return (
    <Switch
      onChange={(checked: boolean) => {
        setIsChecked(checked);
        updateHeadlessMode(checked);
      }}
      checked={isChecked}
      id="headless-mode"
    />
  );
};

export default HeadLessMode;
