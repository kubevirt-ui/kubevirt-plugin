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

  const orderKeys = [...activeColumnKeys, ACTIONS];
  return orderColumnsByKeys(filtered, orderKeys);
};
