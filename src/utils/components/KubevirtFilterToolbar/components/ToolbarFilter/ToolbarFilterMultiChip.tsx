import React, { FC, PropsWithChildren } from 'react';

import {
  KubevirtFilter,
  KubevirtFilterState,
  OnSetFilters,
} from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ToolbarFilter, ToolbarLabel } from '@patternfly/react-core';
import { EXCLUSION_URL_PREFIX } from '@search/searchLanguage/constants';

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
  const { t } = useKubevirtTranslation();
  const selected = filters[filterDef.id] ?? [];

  const resolveLabel = (val: string): string =>
    (filterDef.options?.find((o) => o.value === val)?.label as string) ??
    filterDef.getChipLabel?.(val) ??
    val;

  const getChipText = (val: string) => {
    if (val.startsWith(EXCLUSION_URL_PREFIX)) {
      return t('Exclude {{value}}', { value: resolveLabel(val.slice(1)) });
    }
    return resolveLabel(val);
  };

  return (
    <ToolbarFilter
      deleteLabel={(_, label: ToolbarLabel) => {
        onSetFilters({
          [filterDef.id]: selected.filter((v) => v !== label.key),
        });
      }}
      labels={selected.map((val) => ({
        key: val,
        node: getChipText(val),
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
