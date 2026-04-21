import React, { FC, JSX } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { MenuSearch, MenuSearchInput, TextInput } from '@patternfly/react-core';

import { DropdownConfig } from './types';

type FilterProps = {
  config: DropdownConfig;
  filterRef: React.Ref<HTMLInputElement>;
  filterText: string;
  onFilterChange: (filterText: string) => void;
};

const Filter: FC<FilterProps> = ({
  config,
  filterRef,
  filterText,
  onFilterChange,
}): JSX.Element => {
  const { t } = useKubevirtTranslation();
  return (
    <MenuSearch>
      <MenuSearchInput>
        <TextInput
          aria-label={t(config.selectPlaceholder)}
          autoFocus
          data-test="dropdown-text-filter"
          onChange={(_, value: string) => onFilterChange(value)}
          placeholder={t(config.selectPlaceholder)}
          ref={filterRef}
          type="search"
          value={filterText}
        />
      </MenuSearchInput>
    </MenuSearch>
  );
};

export default Filter;
