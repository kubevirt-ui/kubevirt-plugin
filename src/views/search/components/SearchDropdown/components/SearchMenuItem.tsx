import React, { FC } from 'react';

import { MenuItem, MenuItemProps } from '@patternfly/react-core';

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
