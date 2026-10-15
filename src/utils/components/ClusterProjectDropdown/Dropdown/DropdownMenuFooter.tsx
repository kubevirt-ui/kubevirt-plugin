import type { ReactElement } from 'react';

import { Divider } from '@patternfly/react-core';

import type { DropdownProps } from './types';

type DropdownMenuFooterProps<T> = {
  closeMenu: () => void;
  dropdownProps: DropdownProps<T>;
  filterText: string;
};

function DropdownMenuFooter<T>({
  closeMenu,
  dropdownProps,
  filterText,
}: Readonly<DropdownMenuFooterProps<T>>): ReactElement | null {
  const { config, menuFooter, menuFooterProps } = dropdownProps;

  if (!menuFooter) {
    return null;
  }

  const Footer = menuFooter;

  return (
    <>
      <Divider />
      <div className={`${config.cssPrefix}__menu-footer`}>
        <Footer closeMenu={closeMenu} filterText={filterText} {...menuFooterProps} />
      </div>
    </>
  );
}

export default DropdownMenuFooter;
