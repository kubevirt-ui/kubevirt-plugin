import React, { FC, useEffect, useState } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getIsDynamicSSHInjectionEnabled } from '@kubevirt-utils/resources/vm';
import { Switch } from '@patternfly/react-core';

type DynamicSSHKeyInjectionProps = {
  hasDynamicSSHLabel?: boolean;
  isDisabled: boolean;
  onSubmit: (checked: boolean) => void;
  vm?: V1VirtualMachine;
};
export const DynamicSSHKeyInjection: FC<DynamicSSHKeyInjectionProps> = ({
  hasDynamicSSHLabel,
  isDisabled,
  onSubmit,
  vm,
}) => {
  const [isChecked, setIsChecked] = useState<boolean>(getIsDynamicSSHInjectionEnabled(vm));

  useEffect(() => {
    if (!vm && !hasDynamicSSHLabel) setIsChecked(false);
  }, [vm, hasDynamicSSHLabel, setIsChecked]);

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
