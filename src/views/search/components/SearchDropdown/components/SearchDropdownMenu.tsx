import React, { FC } from 'react';

import { Menu, MenuContent, MenuProps } from '@patternfly/react-core';

import SearchDropdownFooter from './SearchDropdownFooter';

import '../search-dropdown.scss';

const SearchDropdownMenu: FC<MenuProps> = ({ children, ...props }) => {
  return (
    <Menu className="search-dropdown" {...props}>
      <MenuContent className="search-dropdown__content">{children}</MenuContent>
      <SearchDropdownFooter />
    </Menu>
  );
};

export default SearchDropdownMenu;
