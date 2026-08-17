import React, { type FC, useEffect, useState } from 'react';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getIsDynamicSSHInjectionEnabled } from '@kubevirt-utils/resources/vm';
import { Switch } from '@patternfly/react-core';

import { hasDynamicSSHInjectionCommand } from './utils';

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
  const [isChecked, setIsChecked] = useState<boolean>(
    () => getIsDynamicSSHInjectionEnabled(vm) || hasDynamicSSHInjectionCommand(vm),
  );

  useEffect(() => {
    if (!vm && !hasDynamicSSHLabel) setIsChecked(false);
  }, [vm, hasDynamicSSHLabel, setIsChecked]);

  return (
    <Switch
      isChecked={isChecked}
      isDisabled={isDisabled}
      onChange={(_event, checked) => {
        setIsChecked(checked);
        onSubmit(checked);
      }}
    />
  );
};
