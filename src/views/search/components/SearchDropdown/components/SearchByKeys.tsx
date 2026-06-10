import React, { FC, useMemo } from 'react';

import { KubevirtFilter } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Content, ContentVariants, MenuList } from '@patternfly/react-core';

import { SEARCH_KEY_BADGES } from '../constants';
import { SearchKeyBadge } from '../types';

import SearchKeyItem from './SearchKeyItem';

type SearchByKeysProps = {
  filterDefinitions: KubevirtFilter[];
  onSelectKey: (badge: SearchKeyBadge) => void;
};

const SearchByKeys: FC<SearchByKeysProps> = ({ filterDefinitions, onSelectKey }) => {
  const { t } = useKubevirtTranslation();

  const labelLookup = useMemo(() => {
    const map = new Map<string, string>();
    filterDefinitions.forEach((def) => {
      if (def.categoryLabel) map.set(def.id, def.categoryLabel);
    });
    return map;
  }, [filterDefinitions]);

  const getCategoryLabel = (badge: SearchKeyBadge): string =>
    labelLookup.get(badge.filterType) || badge.searchKey;

  const midpoint = Math.ceil(SEARCH_KEY_BADGES.length / 2);
  const leftBadges = SEARCH_KEY_BADGES.slice(0, midpoint);
  const rightBadges = SEARCH_KEY_BADGES.slice(midpoint);

  const getMenuList = (badges: SearchKeyBadge[]) => {
    return (
      <MenuList>
        {badges.map((badge) => (
          <SearchKeyItem
            badge={badge}
            categoryLabel={getCategoryLabel(badge)}
            key={badge.searchKey}
            onClick={onSelectKey}
          />
        ))}
      </MenuList>
    );
  };

  return (
    <div className="search-dropdown__section">
      <div className="search-dropdown__section-title">
        <Content component={ContentVariants.h6}>{t('Search by')}</Content>
        <Content className="search-dropdown__subtitle" component={ContentVariants.small}>
          {t('Hover any key for details')}
        </Content>
      </div>
      <div className="search-dropdown__keys-grid">
        {getMenuList(leftBadges)}
        <div className="search-dropdown__keys-divider" />
        {getMenuList(rightBadges)}
      </div>
    </div>
  );
};

export default SearchByKeys;
