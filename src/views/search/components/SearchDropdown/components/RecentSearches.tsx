import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Content, ContentVariants, MenuList } from '@patternfly/react-core';

import SearchMenuItem from './SearchMenuItem';

type RecentSearchesProps = {
  focusedItemIndex: number;
  onSelectRecentSearch: (token: string) => void;
  recentSearches: string[];
};

const RecentSearches: FC<RecentSearchesProps> = ({
  focusedItemIndex,
  onSelectRecentSearch,
  recentSearches,
}) => {
  const { t } = useKubevirtTranslation();

  if (isEmpty(recentSearches)) return null;

  return (
    <div className="search-dropdown__section">
      <Content className="search-dropdown__section-title" component={ContentVariants.h6}>
        {t('Recent searches')}
      </Content>
      <MenuList className="pf-v6-u-mx-sm">
        {recentSearches.map((token, index) => (
          <SearchMenuItem
            isFocused={index === focusedItemIndex}
            itemId={token}
            key={token}
            onClick={() => onSelectRecentSearch(token)}
          >
            <code>{token}</code>
          </SearchMenuItem>
        ))}
      </MenuList>
    </div>
  );
};

export default RecentSearches;
