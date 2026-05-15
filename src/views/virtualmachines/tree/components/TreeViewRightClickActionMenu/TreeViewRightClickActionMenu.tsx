import React, { FC } from 'react';

import useDismissMenu from './hooks/useDismissMenu';
import { getActionMenuComponent } from './utils';

type TreeViewRightClickActionMenuProps = {
  hideMenu: () => void;
  triggerElement: HTMLElement | null;
};

const TreeViewRightClickActionMenu: FC<TreeViewRightClickActionMenuProps> = ({
  hideMenu,
  triggerElement,
}) => {
  useDismissMenu(hideMenu, !!triggerElement);

  if (!triggerElement) return null;

  const ActionMenu = getActionMenuComponent(triggerElement);

  return <ActionMenu hideMenu={hideMenu} triggerElement={triggerElement} />;
};

export default TreeViewRightClickActionMenu;
