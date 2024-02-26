import React, { Ref } from 'react';

import { MenuToggle, MenuToggleElement, MenuToggleProps } from '@patternfly/react-core';

const DropdownToggle =
  ({ children, ...props }: MenuToggleProps) =>
  (toggleRef: Ref<MenuToggleElement>) =>
    (
      <MenuToggle ref={toggleRef} {...props}>
        {children}
      </MenuToggle>
    );

export default DropdownToggle;
