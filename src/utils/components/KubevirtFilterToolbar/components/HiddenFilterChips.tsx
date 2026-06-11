import React, { FC } from 'react';

import {
  KubevirtFilter,
  KubevirtFilterState,
  OnSetFilters,
} from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { OnEditChip } from '@virtualmachines/list/hooks/useEditChip';

import ToolbarFilterMultiChip from './ToolbarFilter/ToolbarFilterMultiChip';

type HiddenFilterChipsProps = {
  filters: KubevirtFilterState;
  hiddenFilters: KubevirtFilter[];
  onEditChip?: OnEditChip;
  onSetFilters: OnSetFilters;
};

const HiddenFilterChips: FC<HiddenFilterChipsProps> = ({
  filters,
  hiddenFilters,
  onEditChip,
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
          onEditChip={onEditChip}
          onSetFilters={onSetFilters}
        />
      ))}
    </>
  );
};

export default HiddenFilterChips;
