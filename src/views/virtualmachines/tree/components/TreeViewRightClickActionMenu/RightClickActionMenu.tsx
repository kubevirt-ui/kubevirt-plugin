import React, { FC } from 'react';

import ActionDropdownItem from '@kubevirt-utils/components/ActionDropdownItem/ActionDropdownItem';
import { ActionDropdownItemType } from '@kubevirt-utils/components/ActionsDropdown/constants';
import { MenuList, TooltipPosition } from '@patternfly/react-core';

import { RIGHT_CLICK_MENU_Z_INDEX } from './constants';
import RightClickMenuWrapper from './RightClickMenuWrapper';

export type RightClickActionMenuProps = {
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
}) => (
  <RightClickMenuWrapper nestedLevel={nestedLevel} triggerRef={triggerRef}>
    <MenuList>
      {actions?.map((action) => (
        <ActionDropdownItem
          action={action}
          key={action.id}
          setIsOpen={hideMenu}
          tooltipPosition={TooltipPosition.right}
          tooltipZIndex={RIGHT_CLICK_MENU_Z_INDEX + 1}
        />
      ))}
    </MenuList>
  </RightClickMenuWrapper>
);

export default RightClickActionMenu;
