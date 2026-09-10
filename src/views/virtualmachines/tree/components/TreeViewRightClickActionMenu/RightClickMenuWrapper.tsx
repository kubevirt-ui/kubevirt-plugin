import type { FC, ReactNode } from 'react';
import React from 'react';

import { Menu, MenuContent, Popper } from '@patternfly/react-core';

import {
  BASE_MENU_MARGIN,
  MENU_DISTANCE,
  NESTED_LEVEL_MENU_MARGIN,
  RIGHT_CLICK_MENU_Z_INDEX,
} from './constants';

type RightClickMenuWrapperProps = {
  children?: ReactNode;
  nestedLevel: number;
  triggerRef: () => HTMLElement | null;
};

const RightClickMenuWrapper: FC<RightClickMenuWrapperProps> = ({
  children,
  nestedLevel,
  triggerRef,
}) => (
  <Popper
    distance={MENU_DISTANCE}
    isVisible
    popper={
      <Menu
        className="right-click-action-menu"
        containsFlyout
        style={{ marginLeft: `${BASE_MENU_MARGIN + nestedLevel * NESTED_LEVEL_MENU_MARGIN}px` }}
      >
        <MenuContent>{children}</MenuContent>
      </Menu>
    }
    triggerRef={triggerRef}
    zIndex={RIGHT_CLICK_MENU_Z_INDEX}
  />
);

export default RightClickMenuWrapper;
