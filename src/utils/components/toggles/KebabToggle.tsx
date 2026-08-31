import React, { type ReactElement, type Ref } from 'react';

import { MenuToggle, type MenuToggleElement, type MenuToggleProps } from '@patternfly/react-core';
import { EllipsisVIcon } from '@patternfly/react-icons';

const KebabToggle =
  (props: MenuToggleProps) =>
  (toggleRef: Ref<MenuToggleElement>): ReactElement => (
    <MenuToggle data-test="kebab-button" {...props} ref={toggleRef} variant="plain">
      <EllipsisVIcon />
    </MenuToggle>
  );

export default KebabToggle;
