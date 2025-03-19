import React, { FC } from 'react';

import ActionDropdownItem from '@kubevirt-utils/components/ActionDropdownItem/ActionDropdownItem';
import useSingleNodeCluster from '@kubevirt-utils/hooks/useSingleNodeCluster';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { Menu, MenuContent, MenuList, Popper } from '@patternfly/react-core';
import useVirtualMachineActionsProvider from '@virtualmachines/actions/hooks/useVirtualMachineActionsProvider';
import { getVMIMFromMapper } from '@virtualmachines/utils/mappers';

import { vmimMapperSignal, vmsSignal } from '../../utils/signals';

import { getVMComponentsFromID } from './utils';

type VMRightClickActionMenuProps = {
  hideMenu: () => void;
  triggerElement: HTMLElement | null;
};

const VMRightClickActionMenu: FC<VMRightClickActionMenuProps> = ({ hideMenu, triggerElement }) => {
  const { vmName, vmNamespace } = getVMComponentsFromID(triggerElement);

  const [isSingleNodeCluster] = useSingleNodeCluster();

  const vmim = getVMIMFromMapper(vmimMapperSignal.value, vmName, vmNamespace);
  const vm = vmsSignal?.value?.find(
    (resource) => getName(resource) === vmName && getNamespace(resource) === vmNamespace,
  );

  const [actions] = useVirtualMachineActionsProvider(vm, vmim, isSingleNodeCluster);

  return (
    <Popper
      popper={
        <Menu className="right-click-action-menu" containsFlyout>
          <MenuContent>
            <MenuList>
              {actions?.map((action) => (
                <ActionDropdownItem action={action} key={action?.id} setIsOpen={hideMenu} />
              ))}
            </MenuList>
          </MenuContent>
        </Menu>
      }
      appendTo={triggerElement}
      isVisible
      position="end"
    />
  );
};

export default VMRightClickActionMenu;
