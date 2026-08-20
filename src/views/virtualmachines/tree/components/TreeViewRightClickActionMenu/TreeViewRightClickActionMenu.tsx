import { createElement, type FC } from 'react';

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

  return createElement(getActionMenuComponent(triggerElement), {
    hideMenu,
    triggerElement,
  });
};

export default TreeViewRightClickActionMenu;
