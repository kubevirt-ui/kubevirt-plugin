import React, { type ReactElement, type Ref } from 'react';

import { MenuToggle, type MenuToggleElement } from '@patternfly/react-core';

import { type MenuTogglePropsWithTestId } from './SelectToggle';

const DropdownToggle =
  ({ children, 'data-test': dataTestId, ...props }: MenuTogglePropsWithTestId) =>
  (toggleRef: Ref<MenuToggleElement>): ReactElement => (
    <MenuToggle data-test={dataTestId} ref={toggleRef} {...props}>
      {children}
    </MenuToggle>
  );

export default DropdownToggle;
