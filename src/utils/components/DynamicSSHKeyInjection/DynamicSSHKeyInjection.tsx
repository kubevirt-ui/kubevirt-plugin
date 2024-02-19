import React, { FC, useState } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getIsDynamicSSHInjectionEnabled } from '@kubevirt-utils/resources/vm';
import { Switch } from '@patternfly/react-core';

type DynamicSSHKeyInjectionProps = {
  isDisabled: boolean;
  onSubmit: (checked: boolean) => void;
  vm?: V1VirtualMachine;
};
export const DynamicSSHKeyInjection: FC<DynamicSSHKeyInjectionProps> = ({
  isDisabled,
  onSubmit,
  vm,
}) => {
  const [isChecked, setIsChecked] = useState<boolean>(getIsDynamicSSHInjectionEnabled(vm));

  return (
    <Switch
      onChange={(_event, checked) => {
        setIsChecked(checked);
        onSubmit(checked);
      }}
      isChecked={isChecked}
      isDisabled={isDisabled}
    />
  );
};
