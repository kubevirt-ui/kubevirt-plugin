import type { FC } from 'react';

import ActionDropdownItem from '@kubevirt-utils/components/ActionDropdownItem/ActionDropdownItem';
import type { ActionDropdownItemType } from '@kubevirt-utils/components/ActionsDropdown/constants';
import { TooltipPosition } from '@patternfly/react-core';

import { RIGHT_CLICK_MENU_Z_INDEX } from '../constants';

type RightClickActionMenuItemProps = {
  action: ActionDropdownItemType;
  hideMenu: () => void;
};

const RightClickActionMenuItem: FC<RightClickActionMenuItemProps> = ({ action, hideMenu }) => {
  return (
    <ActionDropdownItem
      action={action}
      key={action.id}
      setIsOpen={hideMenu}
      tooltipPosition={TooltipPosition.right}
      tooltipZIndex={RIGHT_CLICK_MENU_Z_INDEX + 1}
    />
  );
};

export default RightClickActionMenuItem;
