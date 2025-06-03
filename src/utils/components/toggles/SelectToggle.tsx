import React, { Ref } from 'react';

import { MenuToggle, MenuToggleElement, MenuToggleProps } from '@patternfly/react-core';

export type MenuTogglePropsWithTestId = MenuToggleProps & {
  'data-test-id'?: string;
};

type SelectToggleProps = MenuTogglePropsWithTestId & {
  selected: any;
};

const SelectToggle = ({
  'data-test-id': dataTestID,
  selected,
  ...menuProps
}: SelectToggleProps) => {
  return (toggleRef: Ref<MenuToggleElement>) => (
    <MenuToggle data-test-id={dataTestID} ref={toggleRef} {...menuProps}>
      {menuProps.children ?? selected}
    </MenuToggle>
  );
};

export default SelectToggle;
