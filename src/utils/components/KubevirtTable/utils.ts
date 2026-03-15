import { ColumnConfig } from '@kubevirt-utils/hooks/useDataViewTableSort/types';

type ColumnLayoutColumn = {
  additional?: boolean;
  id: string;
  title: string;
};

type ColumnLayout = {
  columns: ColumnLayoutColumn[];
  id: string;
  selectedColumns: Set<string>;
  type: string;
};

export const buildColumnLayout = <TData, TCallbacks = undefined>(
  columns: ColumnConfig<TData, TCallbacks>[],
  activeColumnKeys: string[],
  id: string,
  type = '',
): ColumnLayout => ({
  columns: columns
    .filter((col) => col.key !== 'actions')
    .map(({ additional, key, label }) => ({
      additional,
      id: key,
      title: label,
    })),
  id,
  selectedColumns: new Set(activeColumnKeys),
  type,
});
