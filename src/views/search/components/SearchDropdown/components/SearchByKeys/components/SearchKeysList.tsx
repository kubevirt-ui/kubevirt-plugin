import React, { FC } from 'react';

import { MenuList } from '@patternfly/react-core';
import { SearchKeyBadge } from '@search/components/SearchDropdown/types';

import SearchKeyItem from './SearchKeyItem';

type SearchKeysListProps = {
  badges: SearchKeyBadge[];
  focusedItemIndex: number;
  labelLookup: Map<string, string>;
  onSelectKey: (badge: SearchKeyBadge) => void;
  startIndex?: number;
};

const SearchKeysList: FC<SearchKeysListProps> = ({
  badges,
  focusedItemIndex,
  labelLookup,
  onSelectKey,
  startIndex = 0,
}) => {
  const getCategoryLabel = (badge: SearchKeyBadge): string =>
    labelLookup.get(badge.filterType) || badge.searchKey;

  return (
    <MenuList>
      {badges.map((badge, i) => (
        <SearchKeyItem
          badge={badge}
          categoryLabel={getCategoryLabel(badge)}
          isFocused={startIndex + i === focusedItemIndex}
          key={badge.searchKey}
          onClick={onSelectKey}
        />
      ))}
    </MenuList>
  );
};

export default SearchKeysList;
