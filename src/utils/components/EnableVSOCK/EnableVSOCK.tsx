import { type FC, useState } from 'react';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { isVSOCKEnabled } from '@kubevirt-utils/resources/vm';
import { Switch } from '@patternfly/react-core';

type EnableVSOCKProps = {
  isDisabled?: boolean;
  updateVSOCK: (checked: boolean) => Promise<V1VirtualMachine | void>;
  vm: V1VirtualMachine;
};

const EnableVSOCK: FC<EnableVSOCKProps> = ({ isDisabled, updateVSOCK, vm }) => {
  const [isChecked, setIsChecked] = useState<boolean>(() => isVSOCKEnabled(vm));

  return (
    <Switch
      checked={isChecked}
      id="enable-vsock"
      isDisabled={isDisabled}
      onChange={(_event, checked: boolean) => {
        setIsChecked(checked);
        void updateVSOCK(checked);
      }}
    />
  );
};

export default EnableVSOCK;
