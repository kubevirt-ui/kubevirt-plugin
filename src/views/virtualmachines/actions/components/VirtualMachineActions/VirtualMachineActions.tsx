import React, { FC, memo, useMemo } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
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
  const stableOptions = useMemo(() => createLocalMenuOptions(actions), [actions]);
  return (
    <LazyActionMenu
      checkAccessDelegate={checkAccessForFleet}
      context={{ [VirtualMachineModelRef]: vm }}
      key={vm?.metadata?.name}
      localOptions={stableOptions}
      variant={isKebabToggle ? ActionMenuVariant.KEBAB : ActionMenuVariant.DROPDOWN}
    />
  );
};
export default memo(VirtualMachineActions);
