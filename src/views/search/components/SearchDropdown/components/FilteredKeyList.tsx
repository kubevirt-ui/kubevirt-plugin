import React, { FC, useMemo } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Label, MenuItem, MenuList } from '@patternfly/react-core';

import { SearchKeyBadge } from '../types';
import { getFilteredKeyBadges } from '../utils';

type FilteredKeyListProps = {
  filterText: string;
  focusedItemIndex: number;
  onSelectKey: (badge: SearchKeyBadge) => void;
};

const FilteredKeyList: FC<FilteredKeyListProps> = ({
  filterText,
  focusedItemIndex,
  onSelectKey,
}) => {
  const { t } = useKubevirtTranslation();

  const filteredBadges = useMemo(() => getFilteredKeyBadges(filterText), [filterText]);

  if (isEmpty(filteredBadges)) return null;

  return (
    <MenuList>
      {filteredBadges.map((badge, index) => (
        <MenuItem
          onClick={(event) => {
            event.stopPropagation();
            onSelectKey(badge);
          }}
          isFocused={index === focusedItemIndex}
          itemId={badge.searchKey}
          key={badge.searchKey}
          onMouseDown={(event) => event.preventDefault()}
        >
          <Label className="pf-v6-u-mr-sm" isCompact>
            {badge.searchKey}
            {badge.usesColon !== false && ':'}
          </Label>
          <span>{badge.getDescription(t)}</span>
        </MenuItem>
      ))}
    </MenuList>
  );
};

export default FilteredKeyList;
