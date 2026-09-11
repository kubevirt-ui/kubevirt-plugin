import { type JSX, type ReactNode, type Ref } from 'react';

import { MenuToggle, type MenuToggleElement, type MenuToggleProps } from '@patternfly/react-core';

export type MenuTogglePropsWithTestId = MenuToggleProps & {
  'data-test'?: string;
};

type SelectToggleProps = MenuTogglePropsWithTestId & {
  selected: ReactNode;
};

const SelectToggle = ({
  'data-test': dataTestID,
  selected,
  ...menuProps
}: SelectToggleProps): ((toggleRef: Ref<MenuToggleElement>) => JSX.Element) => {
  return (toggleRef: Ref<MenuToggleElement>): JSX.Element => (
    <MenuToggle data-test={dataTestID} ref={toggleRef} {...menuProps}>
      {menuProps.children ?? selected}
    </MenuToggle>
  );
};

export default SelectToggle;
