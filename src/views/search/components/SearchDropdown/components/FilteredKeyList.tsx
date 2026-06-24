import React, { FC, useMemo } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Label, MenuList } from '@patternfly/react-core';

import useSearchKeyBadges from '../hooks/useSearchKeyBadges';
import { SearchKeyBadge } from '../types';
import { getFilteredKeyBadges } from '../utils';

import SearchMenuItem from './SearchMenuItem';

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
  const searchKeyBadges = useSearchKeyBadges();
  const filteredBadges = useMemo(
    () => getFilteredKeyBadges(filterText, searchKeyBadges),
    [filterText, searchKeyBadges],
  );

  if (isEmpty(filteredBadges)) return null;

  return (
    <MenuList>
      {filteredBadges.map((badge, index) => (
        <SearchMenuItem
          isFocused={index === focusedItemIndex}
          itemId={badge.searchKey}
          key={badge.searchKey}
          onClick={() => onSelectKey(badge)}
        >
          <Label className="pf-v6-u-mr-sm" isCompact>
            {badge.searchKey}
            {badge.usesColon !== false && ':'}
          </Label>
          <span>{badge.getDescription(t)}</span>
        </SearchMenuItem>
      ))}
    </MenuList>
  );
};

export default FilteredKeyList;
