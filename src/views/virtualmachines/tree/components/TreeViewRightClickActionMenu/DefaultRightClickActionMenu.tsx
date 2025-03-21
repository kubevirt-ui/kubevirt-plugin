import React, { FC } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';

import ActionDropdownItem from '@kubevirt-utils/components/ActionDropdownItem/ActionDropdownItem';
import { Menu, MenuContent, MenuList, Popper } from '@patternfly/react-core';
import useMultipleVirtualMachineActions from '@virtualmachines/actions/hooks/useMultipleVirtualMachineActions';
import { PROJECT_SELECTOR_PREFIX } from '@virtualmachines/tree/utils/constants';

import { getCreateVMAction, getElementComponentsFromID, getVMsTrigger } from './utils';

type DefaultRightClickActionMenuProps = {
  hideMenu: () => void;
  triggerElement: HTMLElement | null;
};

const DefaultRightClickActionMenu: FC<DefaultRightClickActionMenuProps> = ({
  hideMenu,
  triggerElement,
}) => {
  const { namespace, prefix } = getElementComponentsFromID(triggerElement);

  const vms = getVMsTrigger(triggerElement);
  const actions = useMultipleVirtualMachineActions(vms);

  const navigate = useNavigate();

  if (prefix === PROJECT_SELECTOR_PREFIX) actions.unshift(getCreateVMAction(navigate, namespace));

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

export default DefaultRightClickActionMenu;
