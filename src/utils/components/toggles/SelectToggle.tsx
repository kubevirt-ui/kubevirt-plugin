import React, { Ref } from 'react';

import { MenuToggle, MenuToggleElement, MenuToggleProps } from '@patternfly/react-core';

type SelectToggleProps = MenuToggleProps & {
  'data-test-id'?: string;
  selected: any;
};

const SelectToggle = ({
  'data-test-id': dataTestID,
  selected,
  ...menuProps
}: SelectToggleProps) => {
  return (toggleRef: Ref<MenuToggleElement>) => (
    <MenuToggle data-test-id={dataTestID} ref={toggleRef} {...menuProps}>
      {selected}
    </MenuToggle>
  );
};

export default SelectToggle;
