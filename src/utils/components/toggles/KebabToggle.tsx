import React, { Ref } from 'react';

import { MenuToggle, MenuToggleElement, MenuToggleProps } from '@patternfly/react-core';
import { EllipsisVIcon } from '@patternfly/react-icons';

const KebabToggle = (props: MenuToggleProps) => (toggleRef: Ref<MenuToggleElement>) => (
  <MenuToggle {...props} data-test="kebab-button" ref={toggleRef} variant="plain">
    <EllipsisVIcon />
  </MenuToggle>
);

export default KebabToggle;
