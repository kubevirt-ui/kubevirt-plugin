import React, { FC } from 'react';

import { Label, Tooltip } from '@patternfly/react-core';

import { SearchKeyBadge } from '../types';

type SearchKeyItemProps = {
  badge: SearchKeyBadge;
  categoryLabel: string;
  onClick: (badge: SearchKeyBadge) => void;
};

const SearchKeyItem: FC<SearchKeyItemProps> = ({ badge, categoryLabel, onClick }) => (
  <Tooltip content={badge.description} key={badge.displayKey}>
    <button
      className="search-dropdown__item search-dropdown__key-item"
      onClick={() => onClick(badge)}
      type="button"
    >
      <Label isCompact variant="outline">
        {badge.displayKey}
        {badge.usesColon !== false && ':'}
      </Label>
      <span className="search-dropdown__key-label">{categoryLabel}</span>
    </button>
  </Tooltip>
);

export default SearchKeyItem;
