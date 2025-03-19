import React, { FC } from 'react';

import {
  FOLDER_SELECTOR_PREFIX,
  PROJECT_SELECTOR_PREFIX,
} from '@virtualmachines/tree/utils/constants';

import DefaultRightClickActionMenu from './DefaultRightClickActionMenu';
import VMRightClickActionMenu from './VMRightClickActionMenu';

type TreeViewRightClickActionMenuProps = {
  hideMenu: () => void;
  triggerElement: HTMLElement | null;
};

const TreeViewRightClickActionMenu: FC<TreeViewRightClickActionMenuProps> = ({
  hideMenu,
  triggerElement,
}) => {
  if (!triggerElement) return null;

  const ActionMenu =
    triggerElement.id?.startsWith(PROJECT_SELECTOR_PREFIX) ||
    triggerElement.id?.startsWith(FOLDER_SELECTOR_PREFIX)
      ? DefaultRightClickActionMenu
      : VMRightClickActionMenu;

  return (
    <>
      <ActionMenu hideMenu={hideMenu} triggerElement={triggerElement} />
      <div className="right-click-action-menu-background" onClick={hideMenu}></div>
    </>
  );
};

export default TreeViewRightClickActionMenu;
