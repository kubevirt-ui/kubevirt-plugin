import React, { FC } from 'react';

import { getLabel, getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getCluster } from '@multicluster/helpers/selectors';
import useVirtualMachineActionsProvider from '@virtualmachines/actions/hooks/useVirtualMachineActionsProvider';
import { VM_FOLDER_LABEL } from '@virtualmachines/tree/utils/constants';
import { getVMIMFromMapper } from '@virtualmachines/utils/mappers';

import { vmimMapperSignal, vmsSignal } from '../../utils/signals';

import RightClickActionMenu from './RightClickActionMenu';
import { getVMComponentsFromID } from './utils';

type VMRightClickActionMenuProps = {
  hideMenu: () => void;
  triggerElement: HTMLElement | null;
};

const VMRightClickActionMenu: FC<VMRightClickActionMenuProps> = ({ hideMenu, triggerElement }) => {
  const { vmCluster, vmName, vmNamespace } = getVMComponentsFromID(triggerElement);

  const vmim = getVMIMFromMapper(vmimMapperSignal.value, vmName, vmNamespace, vmCluster);
  const vm = vmsSignal?.value?.find(
    (resource) =>
      getName(resource) === vmName &&
      getNamespace(resource) === vmNamespace &&
      getCluster(resource) === vmCluster,
  );

  const [actions] = useVirtualMachineActionsProvider(vm, vmim);

  const vmHasFolder = !!getLabel(vm, VM_FOLDER_LABEL);

  const getNestedLevel = () => {
    if (vmHasFolder) {
      return vmCluster ? 4 : 3;
    }
    return vmCluster ? 3 : 2;
  };

  const nestedLevel = getNestedLevel();

  return (
    <RightClickActionMenu
      actions={actions}
      hideMenu={hideMenu}
      nestedLevel={nestedLevel}
      triggerRef={() => triggerElement}
    />
  );
};

export default VMRightClickActionMenu;
