import { ColumnConfig } from '@kubevirt-utils/hooks/useDataViewTableSort/types';
import { ACTIONS } from '@kubevirt-utils/hooks/useKubevirtUserSettings/utils/const';
import { isEmpty } from '@kubevirt-utils/utils/utils';

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

  return !isEmpty(filtered) ? filtered : columns.filter((col) => !col.additional);
};
