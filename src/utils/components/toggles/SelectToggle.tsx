import React, { Ref } from 'react';

import { MenuToggle, MenuToggleElement, MenuToggleProps } from '@patternfly/react-core';

export type MenuTogglePropsWithTestId = MenuToggleProps & {
  'data-test'?: string;
};

type SelectToggleProps = MenuTogglePropsWithTestId & {
  selected: any;
};

const SelectToggle = ({ 'data-test': dataTestID, selected, ...menuProps }: SelectToggleProps) => {
  return (toggleRef: Ref<MenuToggleElement>) => (
    <MenuToggle data-test={dataTestID} ref={toggleRef} {...menuProps}>
      {menuProps.children ?? selected}
    </MenuToggle>
  );
};

export default SelectToggle;
