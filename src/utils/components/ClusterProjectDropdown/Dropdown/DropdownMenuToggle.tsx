import type { FC, JSX, RefObject } from 'react';
import { memo } from 'react';

import { MenuToggle } from '@patternfly/react-core';

import type { DropdownConfig } from './types';

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
