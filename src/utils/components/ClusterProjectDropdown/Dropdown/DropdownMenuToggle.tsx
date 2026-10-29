import type { FC, JSX, RefObject } from 'react';
import { memo } from 'react';

import { MenuToggle, Spinner } from '@patternfly/react-core';

import type { DropdownConfig } from './types';

type DropdownMenuToggleProps = {
  config: DropdownConfig;
  disabled?: boolean;
  isLoading?: boolean;
  isOpen: boolean;
  onToggle: (isOpen: boolean) => void;
  title: string;
  toggleRef: RefObject<HTMLButtonElement>;
};

const DropdownMenuToggle: FC<DropdownMenuToggleProps> = memo(
  ({
    config,
    disabled = false,
    isLoading = false,
    isOpen,
    onToggle,
    title,
    toggleRef,
  }): JSX.Element => (
    <MenuToggle
      aria-label={title}
      data-test={`${config.dataTestId}-toggle`}
      isDisabled={disabled || isLoading}
      isExpanded={isOpen}
      onClick={() => onToggle(!isOpen)}
      ref={toggleRef}
    >
      {isLoading ? (
        <span className="pf-v6-u-display-inline-flex pf-v6-u-align-items-center">
          <Spinner className="pf-v6-u-mr-sm" size="sm" />
          {title}
        </span>
      ) : (
        title
      )}
    </MenuToggle>
  ),
);

export default DropdownMenuToggle;
