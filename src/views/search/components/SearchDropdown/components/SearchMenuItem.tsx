import type { FC } from 'react';
import React from 'react';

import type { MenuItemProps } from '@patternfly/react-core';
import { MenuItem } from '@patternfly/react-core';

const SearchMenuItem: FC<MenuItemProps> = ({ children, onClick, ...props }) => (
  <MenuItem
    onClick={(event) => {
      event.stopPropagation();
      onClick();
    }}
    onMouseDown={(event) => event.preventDefault()}
    {...props}
  >
    {children}
  </MenuItem>
);

export default SearchMenuItem;
