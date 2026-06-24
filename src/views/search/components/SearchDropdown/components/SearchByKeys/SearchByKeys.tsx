import React, { FC, useMemo } from 'react';

import { KubevirtFilter } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Content, ContentVariants } from '@patternfly/react-core';

import useSearchKeyBadges from '../../hooks/useSearchKeyBadges';
import { SearchKeyBadge } from '../../types';

import SearchKeysList from './components/SearchKeysList';

type SearchByKeysProps = {
  filterDefinitions: KubevirtFilter[];
  focusedItemIndex: number;
  onSelectKey: (badge: SearchKeyBadge) => void;
};

const SearchByKeys: FC<SearchByKeysProps> = ({
  filterDefinitions,
  focusedItemIndex,
  onSelectKey,
}) => {
  const { t } = useKubevirtTranslation();
  const searchKeyBadges = useSearchKeyBadges();

  const labelLookup = useMemo(() => {
    const map = new Map<string, string>();
    filterDefinitions.forEach((def) => {
      if (def.categoryLabel) map.set(def.id, def.categoryLabel);
    });
    return map;
  }, [filterDefinitions]);

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
        <SearchKeysList
          badges={leftBadges}
          focusedItemIndex={focusedItemIndex}
          labelLookup={labelLookup}
          onSelectKey={onSelectKey}
        />
        <div className="search-dropdown__keys-divider" />
        <SearchKeysList
          badges={rightBadges}
          focusedItemIndex={focusedItemIndex}
          labelLookup={labelLookup}
          onSelectKey={onSelectKey}
          startIndex={midpoint}
        />
      </div>
    </div>
  );
};

export default SearchByKeys;
