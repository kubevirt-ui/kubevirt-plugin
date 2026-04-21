import React, { FC, memo, useMemo } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { ActionDropdownItemType } from '@kubevirt-utils/components/ActionsDropdown/constants';
import LazyActionMenu from '@kubevirt-utils/components/LazyActionMenu/LazyActionMenu';
import {
  checkAccessForFleet,
  createLocalMenuOptions,
} from '@kubevirt-utils/components/LazyActionMenu/overrides';
import { VirtualMachineModelRef } from '@kubevirt-utils/models';
import { ActionMenuVariant } from '@openshift-console/dynamic-plugin-sdk/lib/api/internal-types';

import './VirtualMachineActions.scss';

type VirtualMachinesInstanceActionsProps = {
  actions?: ActionDropdownItemType[];
  isKebabToggle?: boolean;
  vm: V1VirtualMachine;
};

const VirtualMachineActions: FC<VirtualMachinesInstanceActionsProps> = ({
  actions,
  isKebabToggle,
  vm,
}) => {
  const localOptions = useMemo(() => createLocalMenuOptions(actions), [actions]);
  const context = useMemo(() => ({ [VirtualMachineModelRef]: vm }), [vm]);
  return (
    <LazyActionMenu
      checkAccessDelegate={checkAccessForFleet}
      context={context}
      key={vm?.metadata?.name}
      localOptions={localOptions}
      variant={isKebabToggle ? ActionMenuVariant.KEBAB : ActionMenuVariant.DROPDOWN}
    />
  );
};
export default memo(VirtualMachineActions);
