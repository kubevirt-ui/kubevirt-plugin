import React, { FC, useMemo } from 'react';

import { ActionDropdownItemType } from '@kubevirt-utils/components/ActionsDropdown/constants';
import ActionMenuContent from '@kubevirt-utils/components/LazyActionMenu/ActionMenuContent';
import {
  checkAccessForFleet,
  createLocalMenuOptions,
} from '@kubevirt-utils/components/LazyActionMenu/overrides';
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
  const localOptions = useMemo(() => createLocalMenuOptions(actions), [actions]);
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
              <ActionMenuContent
                checkAccess={checkAccessForFleet}
                onClick={hideMenu}
                options={localOptions}
              />
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
