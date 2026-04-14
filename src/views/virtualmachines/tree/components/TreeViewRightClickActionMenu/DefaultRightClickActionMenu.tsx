import React, { FC } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useVirtualMachineInstanceMigrationMapper from '@kubevirt-utils/resources/vmim/hooks/useVirtualMachineInstanceMigrationMapper';
import useVirtualMachineInstanceMigrations from '@kubevirt-utils/resources/vmim/hooks/useVirtualMachineInstanceMigrations';
import useMultipleVirtualMachineActions from '@virtualmachines/actions/hooks/useMultipleVirtualMachineActions';
import {
  FOLDER_SELECTOR_PREFIX,
  PROJECT_SELECTOR_PREFIX,
} from '@virtualmachines/tree/utils/constants';

import GroupedRightClickActionMenu from './GroupedRightClickActionMenu';
import { getCreateVMAction, getElementComponentsFromID, getVMsTrigger } from './utils';

type DefaultRightClickActionMenuProps = {
  hideMenu: () => void;
  triggerElement: HTMLElement | null;
};

const DefaultRightClickActionMenu: FC<DefaultRightClickActionMenuProps> = ({
  hideMenu,
  triggerElement,
}) => {
  const { t } = useKubevirtTranslation();
  const { cluster, namespace, prefix } = getElementComponentsFromID(triggerElement);

  const vms = getVMsTrigger(triggerElement);
  const [vmims] = useVirtualMachineInstanceMigrations(cluster, namespace);
  const vmimMapper = useVirtualMachineInstanceMigrationMapper(vmims);
  const baseActions = useMultipleVirtualMachineActions(vms, vmimMapper, true);

  const navigate = useNavigate();

  const createVMAction =
    prefix === PROJECT_SELECTOR_PREFIX
      ? getCreateVMAction(t, navigate, namespace, cluster)
      : undefined;

  const getNestedLevel = () => {
    if (prefix === FOLDER_SELECTOR_PREFIX) {
      return cluster ? 3 : 2;
    }
    return cluster ? 2 : 1;
  };

  const nestedLevel = getNestedLevel();

  return (
    <GroupedRightClickActionMenu
      actions={baseActions}
      createVMAction={createVMAction}
      hideMenu={hideMenu}
      nestedLevel={nestedLevel}
      triggerRef={() => triggerElement.children.item(0) as HTMLElement}
    />
  );
};

export default DefaultRightClickActionMenu;
