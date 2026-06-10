import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Label, MenuItem, Tooltip } from '@patternfly/react-core';

import { SearchKeyBadge } from '../types';

type SearchKeyItemProps = {
  badge: SearchKeyBadge;
  categoryLabel: string;
  onClick: (badge: SearchKeyBadge) => void;
};

const SearchKeyItem: FC<SearchKeyItemProps> = ({ badge, categoryLabel, onClick }) => {
  const { t } = useKubevirtTranslation();
  const { getDescription, searchKey, usesColon } = badge;

  return (
    <Tooltip content={getDescription(t)}>
      <MenuItem
        onClick={(event) => {
          event.stopPropagation();
          onClick(badge);
        }}
        itemId={searchKey}
        onMouseDown={(event) => event.preventDefault()}
      >
        <Label className="pf-v6-u-mr-sm" isCompact>
          {searchKey}
          {usesColon !== false && ':'}
        </Label>
        <span>{categoryLabel}</span>
      </MenuItem>
    </Tooltip>
  );
};

export default SearchKeyItem;
