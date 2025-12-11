import React, { FC, JSX } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Divider, MenuGroup, MenuItem, MenuList } from '@patternfly/react-core';

import { DropdownConfig, DropdownOption } from './types';

type DropdownGroupProps = {
  config: DropdownConfig;
  favorites?: Record<string, boolean>;
  isFavorites?: boolean;
  options: DropdownOption[];
  selectedKey: string;
};

const DropdownGroup: FC<DropdownGroupProps> = ({
  config,
  favorites,
  isFavorites,
  options,
  selectedKey,
}): JSX.Element | null => {
  const { t } = useKubevirtTranslation();
  const label = isFavorites ? t('Favorites') : config.itemsLabel;

  if (options.length === 0) return null;

  return (
    <>
      <Divider />
      <MenuGroup label={label}>
        <MenuList>
          {options.map((option) => {
            const isFavorite = !!favorites?.[option.key];
            return (
              <MenuItem
                isFavorited={isFavorite}
                isSelected={selectedKey === option.key}
                itemId={option.key}
                key={option.key}
              >
                {option.title}
              </MenuItem>
            );
          })}
        </MenuList>
      </MenuGroup>
    </>
  );
};

export default DropdownGroup;
