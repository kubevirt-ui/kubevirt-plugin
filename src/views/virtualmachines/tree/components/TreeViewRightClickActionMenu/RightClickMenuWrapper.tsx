import React, { FCC } from 'react';

import { Menu, MenuContent, Popper } from '@patternfly/react-core';

import {
  BASE_MENU_MARGIN,
  MENU_DISTANCE,
  NESTED_LEVEL_MENU_MARGIN,
  RIGHT_CLICK_MENU_Z_INDEX,
} from './constants';

type RightClickMenuWrapperProps = {
  nestedLevel: number;
  triggerRef: () => HTMLElement | null;
};

const RightClickMenuWrapper: FCC<RightClickMenuWrapperProps> = ({
  children,
  nestedLevel,
  triggerRef,
}) => (
  <Popper
    popper={
      <Menu
        className="right-click-action-menu"
        containsFlyout
        style={{ marginLeft: `${BASE_MENU_MARGIN + nestedLevel * NESTED_LEVEL_MENU_MARGIN}px` }}
      >
        <MenuContent>{children}</MenuContent>
      </Menu>
    }
    distance={MENU_DISTANCE}
    isVisible
    triggerRef={triggerRef}
    zIndex={RIGHT_CLICK_MENU_Z_INDEX}
  />
);

export default RightClickMenuWrapper;
