import type { ColumnConfig } from '@kubevirt-utils/hooks/useDataViewTableSort/types';
import { ACTIONS } from '@kubevirt-utils/hooks/useKubevirtUserSettings/utils/const';
import { isEmpty } from '@kubevirt-utils/utils/utils';

import { orderColumnsByKeys } from './orderColumnsByKeys';

export const getActiveColumns = <TData, TCallbacks = undefined>(
  columns: ColumnConfig<TData, TCallbacks>[],
  activeColumnKeys?: string[],
): ColumnConfig<TData, TCallbacks>[] => {
  if (!activeColumnKeys) {
    return columns.filter((col) => !col.additional);
  }

  const filtered = columns.filter(
    (col) => activeColumnKeys.includes(col.key) || col.key === ACTIONS,
  );

  if (isEmpty(filtered)) {
    return columns.filter((col) => !col.additional);
  }

  // Force the actions (kebab) column to be last, regardless of where ACTIONS appears in
  // activeColumnKeys. Callers don't need to position it themselves.
  const orderKeys = [...activeColumnKeys.filter((key) => key !== ACTIONS), ACTIONS];
  return orderColumnsByKeys(filtered, orderKeys);
};
