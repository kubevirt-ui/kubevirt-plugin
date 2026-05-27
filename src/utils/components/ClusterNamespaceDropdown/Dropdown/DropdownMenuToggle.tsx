import React, { FC, JSX, memo, RefObject } from 'react';

import { MenuToggle } from '@patternfly/react-core';

import { DropdownConfig } from './types';

type DropdownMenuToggleProps = {
  config: DropdownConfig;
  disabled?: boolean;
  isOpen: boolean;
  onToggle: (isOpen: boolean) => void;
  title: string;
  toggleRef: RefObject<HTMLButtonElement>;
};

const DropdownMenuToggle: FC<DropdownMenuToggleProps> = memo(
  ({ config, disabled = false, isOpen, onToggle, title, toggleRef }): JSX.Element => (
    <MenuToggle
      aria-label={title}
      data-test={`${config.dataTestId}-toggle`}
      isDisabled={disabled}
      isExpanded={isOpen}
      onClick={() => onToggle(!isOpen)}
      ref={toggleRef}
    >
      {title}
    </MenuToggle>
  ),
);

export default DropdownMenuToggle;
