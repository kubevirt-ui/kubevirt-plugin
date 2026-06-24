import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Label, Tooltip } from '@patternfly/react-core';

import { TOOLTIP_DELAY_MS } from '../../../constants';
import { SearchKeyBadge } from '../../../types';
import SearchMenuItem from '../../SearchMenuItem';

type SearchKeyItemProps = {
  badge: SearchKeyBadge;
  categoryLabel: string;
  isFocused?: boolean;
  onClick: (badge: SearchKeyBadge) => void;
};

const SearchKeyItem: FC<SearchKeyItemProps> = ({ badge, categoryLabel, isFocused, onClick }) => {
  const { t } = useKubevirtTranslation();
  const { getDescription, searchKey, usesColon } = badge;

  return (
    <Tooltip content={getDescription(t)} entryDelay={TOOLTIP_DELAY_MS}>
      <SearchMenuItem isFocused={isFocused} itemId={searchKey} onClick={() => onClick(badge)}>
        <Label className="pf-v6-u-mr-sm" isCompact>
          {searchKey}
          {usesColon !== false && ':'}
        </Label>
        <span>{categoryLabel}</span>
      </SearchMenuItem>
    </Tooltip>
  );
};

export default SearchKeyItem;
