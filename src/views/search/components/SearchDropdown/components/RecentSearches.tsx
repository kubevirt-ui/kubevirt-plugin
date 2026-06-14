import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Content, ContentVariants } from '@patternfly/react-core';

type RecentSearchesProps = {
  onSelectRecentSearch: (token: string) => void;
  recentSearches: string[];
};

const RecentSearches: FC<RecentSearchesProps> = ({ onSelectRecentSearch, recentSearches }) => {
  const { t } = useKubevirtTranslation();

  if (!recentSearches.length) return null;

  return (
    <div className="search-dropdown__section">
      <Content className="search-dropdown__section-title" component={ContentVariants.h6}>
        {t('Recent searches')}
      </Content>
      <ul className="search-dropdown__list">
        {recentSearches.map((token) => (
          <li key={token}>
            <button
              className="search-dropdown__item search-dropdown__recent-item"
              onClick={() => onSelectRecentSearch(token)}
              type="button"
            >
              {token}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecentSearches;
