import React, { FCC } from 'react';

import ActionDropdownItem from '@kubevirt-utils/components/ActionDropdownItem/ActionDropdownItem';
import { ActionDropdownItemType } from '@kubevirt-utils/components/ActionsDropdown/constants';
import { MenuList } from '@patternfly/react-core';

import RightClickMenuWrapper from './RightClickMenuWrapper';

export type RightClickActionMenuProps = {
  actions: ActionDropdownItemType[];
  hideMenu: () => void;
  nestedLevel: number;
  triggerRef: () => HTMLElement | null;
};

const RightClickActionMenu: FCC<RightClickActionMenuProps> = ({
  actions,
  hideMenu,
  nestedLevel,
  triggerRef,
}) => (
  <RightClickMenuWrapper nestedLevel={nestedLevel} triggerRef={triggerRef}>
    <MenuList>
      {actions?.map((action) => (
        <ActionDropdownItem action={action} key={action.id} setIsOpen={hideMenu} />
      ))}
    </MenuList>
  </RightClickMenuWrapper>
);

export default RightClickActionMenu;
