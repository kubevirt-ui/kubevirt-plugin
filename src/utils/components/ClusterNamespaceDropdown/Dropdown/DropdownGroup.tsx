import React, { FC, JSX } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Divider, MenuGroup, MenuItem, MenuList, TooltipPosition } from '@patternfly/react-core';

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
            // Use isAriaDisabled instead of isDisabled when tooltip is present
            // This allows tooltips to work on disabled items (isDisabled sets pointer-events: none)
            const hasTooltip = !!option.tooltip;
            return (
              <MenuItem
                tooltipProps={
                  option.tooltip
                    ? {
                        content: option.tooltip,
                        position: TooltipPosition.left,
                      }
                    : undefined
                }
                isAriaDisabled={option.disabled && hasTooltip}
                isDisabled={option.disabled && !hasTooltip}
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
