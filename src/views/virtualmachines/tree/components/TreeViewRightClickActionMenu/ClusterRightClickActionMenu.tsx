import React, { FC } from 'react';

import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import useClusterActions from '@virtualmachines/tree/hooks/useClusterActions';

import RightClickActionMenu from './RightClickActionMenu';
import { getElementComponentsFromID } from './utils';

type ClusterRightClickActionMenuProps = {
  hideMenu: () => void;
  triggerElement: HTMLElement | null;
};

const ClusterRightClickActionMenu: FC<ClusterRightClickActionMenuProps> = ({
  hideMenu,
  triggerElement,
}) => {
  const { cluster } = getElementComponentsFromID(triggerElement);
  const actions = useClusterActions(cluster);

  const nestedLevel = triggerElement?.id === ALL_NAMESPACES_SESSION_KEY ? 0 : 1;

  return (
    <RightClickActionMenu
      actions={actions}
      hideMenu={hideMenu}
      nestedLevel={nestedLevel}
      triggerRef={() => triggerElement.children.item(0) as HTMLElement}
    />
  );
};

export default ClusterRightClickActionMenu;
