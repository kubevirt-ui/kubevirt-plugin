import type { FC } from 'react';

import type { ActionDropdownItemType } from '@kubevirt-utils/components/ActionsDropdown/constants';
import { MenuList } from '@patternfly/react-core';

import RightClickActionMenuItem from './components/RightClickActionMenuItem';
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
        <RightClickActionMenuItem action={action} hideMenu={hideMenu} key={action.id} />
      ))}
    </MenuList>
  </RightClickMenuWrapper>
);

export default RightClickActionMenu;
