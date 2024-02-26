import React, { Ref } from 'react';

import { MenuToggle, MenuToggleElement, MenuToggleProps } from '@patternfly/react-core';

type SelectToggleProps = MenuToggleProps & {
  selected: any;
};

const SelectToggle = ({ selected, ...menuProps }: SelectToggleProps) => {
  return (toggleRef: Ref<MenuToggleElement>) => (
    <MenuToggle ref={toggleRef} {...menuProps}>
      {selected}
    </MenuToggle>
  );
};

export default SelectToggle;
