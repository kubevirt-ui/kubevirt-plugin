import React, { FC } from 'react';
import classNames from 'classnames';

import ActionDropdownItem from '@kubevirt-utils/components/ActionDropdownItem/ActionDropdownItem';
import { getLabel, getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getCluster } from '@multicluster/helpers/selectors';
import { Menu, MenuContent, MenuList, Popper } from '@patternfly/react-core';
import useVirtualMachineActionsProvider from '@virtualmachines/actions/hooks/useVirtualMachineActionsProvider';
import { VM_FOLDER_LABEL } from '@virtualmachines/tree/utils/constants';
import { getVMIMFromMapper } from '@virtualmachines/utils/mappers';

import { vmimMapperSignal, vmsSignal } from '../../utils/signals';

import { MENU_DISTANCE } from './constants';
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

  return (
    <Popper
      popper={
        <Menu
          className={classNames(
            'right-click-action-menu',
            vmHasFolder ? 'right-click-action-menu--nested-2' : 'right-click-action-menu--nested-1',
          )}
          containsFlyout
        >
          <MenuContent>
            <MenuList>
              {actions?.map((action) => (
                <ActionDropdownItem action={action} key={action?.id} setIsOpen={hideMenu} />
              ))}
            </MenuList>
          </MenuContent>
        </Menu>
      }
      distance={MENU_DISTANCE}
      isVisible
      triggerRef={() => triggerElement}
    />
  );
};

export default VMRightClickActionMenu;
