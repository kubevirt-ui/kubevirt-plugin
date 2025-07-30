import React, { FC } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';
import classNames from 'classnames';

import ActionDropdownItem from '@kubevirt-utils/components/ActionDropdownItem/ActionDropdownItem';
import { getCluster } from '@multicluster/helpers/selectors';
import { Menu, MenuContent, MenuList, Popper } from '@patternfly/react-core';
import useMultipleVirtualMachineActions from '@virtualmachines/actions/hooks/useMultipleVirtualMachineActions';
import {
  FOLDER_SELECTOR_PREFIX,
  PROJECT_SELECTOR_PREFIX,
} from '@virtualmachines/tree/utils/constants';

import { MENU_DISTANCE } from './constants';
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
  const cluster = getCluster(vms?.[0]);
  const actions = useMultipleVirtualMachineActions(vms);

  const navigate = useNavigate();

  if (prefix === PROJECT_SELECTOR_PREFIX)
    actions.unshift(getCreateVMAction(navigate, namespace, cluster));

  return (
    <Popper
      popper={
        <Menu
          className={classNames(
            'right-click-action-menu',
            prefix === FOLDER_SELECTOR_PREFIX ? 'right-click-action-menu--nested-1' : '',
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
      triggerRef={() => triggerElement.children.item(0) as HTMLElement}
    />
  );
};

export default DefaultRightClickActionMenu;
