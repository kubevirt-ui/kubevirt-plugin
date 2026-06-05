import React, { useMemo } from 'react';

import ExportTableButton from '@kubevirt-utils/components/ExportTableButton/ExportTableButton';
import { getActiveColumns } from '@kubevirt-utils/components/KubevirtTable/utils/getActiveColumns';
import { ColumnConfig } from '@kubevirt-utils/hooks/useDataViewTableSort/types';
import { useDataViewTableSort } from '@kubevirt-utils/hooks/useDataViewTableSort/useDataViewTableSort';
import { isEmpty } from '@kubevirt-utils/utils/utils';

import { buildExportFilename, DEFAULT_EXPORT_FILENAME, ExportTableKey } from './constants';
import useExportParams from './useExportParams';

type ExportKey = `${string}-${ExportTableKey}` | ExportTableKey;

export type KubevirtTableExportProps<TData, TCallbacks = undefined> = {
  activeColumnKeys?: string[];
  asToolbarItem?: boolean;
  callbacks?: TCallbacks;
  columns: ColumnConfig<TData, TCallbacks>[];
  data: TData[];
  exportFilename?: string;
  exportKey?: ExportKey;
  initialSortColumnIndex?: number;
  initialSortDirection?: 'asc' | 'desc';
  initialSortKey?: string;
  loaded?: boolean;
};

const KubevirtTableExport = <TData, TCallbacks = undefined>({
  activeColumnKeys,
  asToolbarItem = true,
  callbacks,
  columns,
  data,
  exportFilename,
  exportKey,
  initialSortColumnIndex,
  initialSortDirection,
  initialSortKey,
  loaded = true,
}: KubevirtTableExportProps<TData, TCallbacks>) => {
  const { cluster, namespace } = useExportParams();

  const resolvedFilename = useMemo(() => {
    if (exportFilename) return exportFilename;
    if (exportKey) return buildExportFilename(cluster, namespace, exportKey);
    return DEFAULT_EXPORT_FILENAME;
  }, [cluster, exportFilename, exportKey, namespace]);

  const activeColumns = useMemo(
    () => getActiveColumns(columns, activeColumnKeys),
    [columns, activeColumnKeys],
  );

  const effectiveInitialSortKey = useMemo(() => {
    if (initialSortKey) return initialSortKey;
    if (initialSortColumnIndex !== undefined && activeColumns[initialSortColumnIndex]) {
      return activeColumns[initialSortColumnIndex].key;
    }
    return activeColumns[0]?.key;
  }, [initialSortKey, initialSortColumnIndex, activeColumns]);

  const { sortedData } = useDataViewTableSort(
    data,
    activeColumns,
    effectiveInitialSortKey,
    initialSortDirection,
    callbacks,
  );

  return (
    <ExportTableButton
      activeColumnKeys={activeColumnKeys}
      asToolbarItem={asToolbarItem}
      callbacks={callbacks}
      columns={columns}
      data={sortedData}
      filename={resolvedFilename}
      isDisabled={!loaded || isEmpty(data)}
      loaded={loaded}
    />
  );
};

export default KubevirtTableExport;
