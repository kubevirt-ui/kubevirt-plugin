import React, { FC, PropsWithChildren } from 'react';

import {
  KubevirtFilter,
  KubevirtFilterState,
  OnSetFilters,
} from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { ToolbarFilter, ToolbarLabel } from '@patternfly/react-core';

type ToolbarFilterMultiChipProps = PropsWithChildren<{
  filterDef: KubevirtFilter;
  filters: KubevirtFilterState;
  onSetFilters: OnSetFilters;
}>;

const ToolbarFilterMultiChip: FC<ToolbarFilterMultiChipProps> = ({
  children,
  filterDef,
  filters,
  onSetFilters,
}) => {
  const selected = filters[filterDef.id] ?? [];

  return (
    <ToolbarFilter
      deleteLabel={(_, label: ToolbarLabel) => {
        onSetFilters({
          [filterDef.id]: selected.filter((v) => v !== label.key),
        });
      }}
      labels={selected.map((val) => ({
        key: val,
        node:
          filterDef.options?.find((o) => o.value === val)?.label ??
          filterDef.getChipLabel?.(val) ??
          val,
      }))}
      categoryName={filterDef.categoryLabel ?? ' '}
      deleteLabelGroup={() => onSetFilters({ [filterDef.id]: [] })}
      showToolbarItem={Boolean(children)}
    >
      {children}
    </ToolbarFilter>
  );
};

export default ToolbarFilterMultiChip;
