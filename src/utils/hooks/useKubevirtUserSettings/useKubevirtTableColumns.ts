import { useMemo } from 'react';

import { ColumnConfig } from '@kubevirt-utils/hooks/useDataViewTableSort/types';

import { ACTIONS, COLUMNS } from './utils/const';
import useKubevirtUserSettings from './useKubevirtUserSettings';

type UseKubevirtTableColumnsType = <TData, TCallbacks = undefined>(input: {
  columnManagementID: string;
  columns: ColumnConfig<TData, TCallbacks>[];
}) => {
  activeColumnKeys: string[];
  error?: Error;
  loaded: boolean;
};

const useKubevirtTableColumns: UseKubevirtTableColumnsType = ({ columnManagementID, columns }) => {
  const [userColumns, , loadedColumns, error] = useKubevirtUserSettings(COLUMNS);

  const activeColumnKeys = useMemo(() => {
    const savedColumnKeys = userColumns?.[columnManagementID];

    if (savedColumnKeys && savedColumnKeys.length > 0) {
      const validKeys = columns.map((col) => col.key);
      const filteredKeys = savedColumnKeys.filter((key: string) => validKeys.includes(key));
      if (filteredKeys.length > 0) {
        return filteredKeys;
      }
    }

    return columns.filter((col) => !col.additional && col.key !== ACTIONS).map((col) => col.key);
  }, [userColumns, columnManagementID, columns]);

  return {
    activeColumnKeys,
    error,
    loaded: loadedColumns,
  };
};

export default useKubevirtTableColumns;
