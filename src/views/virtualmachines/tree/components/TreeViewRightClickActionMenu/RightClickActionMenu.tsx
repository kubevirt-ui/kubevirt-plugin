import React, { FC } from 'react';

import ActionDropdownItem from '@kubevirt-utils/components/ActionDropdownItem/ActionDropdownItem';
import { ActionDropdownItemType } from '@kubevirt-utils/components/ActionsDropdown/constants';
import { Menu, MenuContent, MenuList, Popper } from '@patternfly/react-core';

import { BASE_MENU_MARGIN, MENU_DISTANCE, NESTED_LEVEL_MENU_MARGIN } from './constants';

type RightClickActionMenuProps = {
  actions: ActionDropdownItemType[];
  hideMenu: () => void;
  nestedLevel: number;
  triggerRef: () => HTMLElement | null;
};

const RightClickActionMenu: FC<RightClickActionMenuProps> = ({
  actions,
  hideMenu,
  nestedLevel,
  triggerRef,
}) => {
  return (
    <Popper
      popper={
        <Menu
          className="right-click-action-menu"
          containsFlyout
          style={{ marginLeft: `${BASE_MENU_MARGIN + nestedLevel * NESTED_LEVEL_MENU_MARGIN}px` }}
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
      triggerRef={triggerRef}
    />
  );
};

export default RightClickActionMenu;
