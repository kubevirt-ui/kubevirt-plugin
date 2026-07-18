import React, { Ref } from 'react';

import { MenuToggle, MenuToggleElement } from '@patternfly/react-core';

import { MenuTogglePropsWithTestId } from './SelectToggle';

const DropdownToggle =
  ({ children, 'data-test': dataTestId, ...props }: MenuTogglePropsWithTestId) =>
  (toggleRef: Ref<MenuToggleElement>) => (
    <MenuToggle data-test={dataTestId} ref={toggleRef} {...props}>
      {children}
    </MenuToggle>
  );

export default DropdownToggle;
