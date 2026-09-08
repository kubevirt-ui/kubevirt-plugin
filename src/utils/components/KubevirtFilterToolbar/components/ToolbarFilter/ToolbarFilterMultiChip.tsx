import React, { type FC, type PropsWithChildren } from 'react';

import {
  type KubevirtFilter,
  type KubevirtFilterState,
  type OnSetFilters,
} from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ToolbarFilter, type ToolbarLabel } from '@patternfly/react-core';
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
    (filterDef.options?.find((opt) => opt.value === val)?.label as string) ??
    filterDef.getChipLabel?.(val) ??
    val;

  const getChipText = (val: string): string => {
    if (val.startsWith(EXCLUSION_URL_PREFIX)) {
      return t('Exclude {{value}}', { value: resolveLabel(val.slice(1)) });
    }
    return resolveLabel(val);
  };

  return (
    <ToolbarFilter
      categoryName={filterDef.categoryLabel ?? ' '}
      deleteLabel={(_event, label: ToolbarLabel) => {
        onSetFilters({
          [filterDef.id]: selected.filter((val) => val !== label.key),
        });
      }}
      deleteLabelGroup={() => onSetFilters({ [filterDef.id]: [] })}
      labels={selected.map((val) => ({
        key: val,
        node: getChipText(val),
      }))}
      showToolbarItem={Boolean(children)}
    >
      {children}
    </ToolbarFilter>
  );
};

export default ToolbarFilterMultiChip;
