import React, { FC } from 'react';

import {
  KubevirtFilter,
  KubevirtFilterState,
  OnSetFilters,
} from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { isEmpty } from '@kubevirt-utils/utils/utils';

import ToolbarFilterMultiChip from './ToolbarFilter/ToolbarFilterMultiChip';

type HiddenFilterChipsProps = {
  filters: KubevirtFilterState;
  hiddenFilters: KubevirtFilter[];
  onSetFilters: OnSetFilters;
};

const HiddenFilterChips: FC<HiddenFilterChipsProps> = ({
  filters,
  hiddenFilters,
  onSetFilters,
}) => {
  if (isEmpty(hiddenFilters)) return null;

  return (
    <>
      {hiddenFilters.map((filterDef) => (
        <ToolbarFilterMultiChip
          filterDef={filterDef}
          filters={filters}
          key={filterDef.id}
          onSetFilters={onSetFilters}
        />
      ))}
    </>
  );
};

export default HiddenFilterChips;
