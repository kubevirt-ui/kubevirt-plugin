import React, { FC, useMemo } from 'react';

import { KubevirtFilter } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Content, ContentVariants } from '@patternfly/react-core';

import { getSearchKeyBadges } from '../constants';
import { SearchKeyBadge } from '../types';

import SearchKeyItem from './SearchKeyItem';

type SearchByKeysProps = {
  filterDefinitions: KubevirtFilter[];
  onSelectKey: (key: string) => void;
};

const SearchByKeys: FC<SearchByKeysProps> = ({ filterDefinitions, onSelectKey }) => {
  const { t } = useKubevirtTranslation();

  const searchKeyBadges = useMemo(() => getSearchKeyBadges(t), [t]);

  const labelLookup = useMemo(() => {
    const map = new Map<string, string>();
    filterDefinitions.forEach((def) => {
      if (def.categoryLabel) map.set(def.id, def.categoryLabel);
    });
    return map;
  }, [filterDefinitions]);

  const getCategoryLabel = (badge: SearchKeyBadge): string =>
    labelLookup.get(badge.filterType) || badge.displayKey;

  const handleClick = (badge: SearchKeyBadge) => {
    const keyText = badge.usesColon ? `${badge.displayKey}:` : badge.displayKey;
    onSelectKey(keyText);
  };

  const midpoint = Math.ceil(searchKeyBadges.length / 2);
  const leftBadges = searchKeyBadges.slice(0, midpoint);
  const rightBadges = searchKeyBadges.slice(midpoint);

  return (
    <div className="search-dropdown__section">
      <div className="search-dropdown__section-title">
        <Content component={ContentVariants.h6}>{t('Search by')}</Content>
        <Content className="search-dropdown__subtitle" component={ContentVariants.small}>
          {t('Hover any key for details')}
        </Content>
      </div>
      <div className="search-dropdown__keys-grid">
        <div>
          {leftBadges.map((badge) => (
            <SearchKeyItem
              badge={badge}
              categoryLabel={getCategoryLabel(badge)}
              key={badge.displayKey}
              onClick={handleClick}
            />
          ))}
        </div>
        <div className="search-dropdown__keys-divider" />
        <div>
          {rightBadges.map((badge) => (
            <SearchKeyItem
              badge={badge}
              categoryLabel={getCategoryLabel(badge)}
              key={badge.displayKey}
              onClick={handleClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchByKeys;
