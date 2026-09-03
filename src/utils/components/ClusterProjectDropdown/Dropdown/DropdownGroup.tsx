import React, { type FC, type JSX } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Divider, MenuGroup, MenuItem, MenuList, TooltipPosition } from '@patternfly/react-core';

import { type DropdownConfig, type DropdownOption } from './types';

type DropdownGroupProps = {
  config: DropdownConfig;
  favorites?: Record<string, boolean>;
  isFavorites?: boolean;
  options: DropdownOption[];
  selectedKey: string;
  showBottomDivider?: boolean;
};

const DropdownGroup: FC<DropdownGroupProps> = ({
  config,
  favorites,
  isFavorites,
  options,
  selectedKey,
  showBottomDivider = false,
}): JSX.Element | null => {
  const { t } = useKubevirtTranslation();
  const label = isFavorites ? t('Favorites') : config.itemsLabel;

  if (options.length === 0) return null;

  return (
    <>
      <MenuGroup label={label}>
        <MenuList>
          {options.map((option) => {
            const isFavorite = !!favorites?.[option.key];
            // Use isAriaDisabled instead of isDisabled when tooltip is present
            // This allows tooltips to work on disabled items (isDisabled sets pointer-events: none)
            const hasTooltip = !!option.tooltip;
            return (
              <MenuItem
                isAriaDisabled={option.disabled && hasTooltip}
                isDisabled={option.disabled && !hasTooltip}
                isFavorited={isFavorite}
                isSelected={selectedKey === option.key}
                itemId={option.key}
                key={option.key}
                tooltipProps={
                  option.tooltip
                    ? {
                        content: option.tooltip,
                        position: TooltipPosition.left,
                      }
                    : undefined
                }
              >
                {option.title}
              </MenuItem>
            );
          })}
        </MenuList>
      </MenuGroup>
      {showBottomDivider && <Divider />}
    </>
  );
};

export default DropdownGroup;
