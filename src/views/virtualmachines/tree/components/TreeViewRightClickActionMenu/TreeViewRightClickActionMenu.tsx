import React, { FC } from 'react';

import { getActionMenuComponent } from './utils';

type TreeViewRightClickActionMenuProps = {
  hideMenu: () => void;
  triggerElement: HTMLElement | null;
};

const TreeViewRightClickActionMenu: FC<TreeViewRightClickActionMenuProps> = ({
  hideMenu,
  triggerElement,
}) => {
  if (!triggerElement) return null;

  const ActionMenu = getActionMenuComponent(triggerElement);

  return (
    <>
      <ActionMenu hideMenu={hideMenu} triggerElement={triggerElement} />
      <div
        className="right-click-action-menu-background"
        data-test="right-click-backdrop"
        onClick={hideMenu}
      />
    </>
  );
};

export default TreeViewRightClickActionMenu;
