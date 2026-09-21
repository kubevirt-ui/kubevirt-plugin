import { type JSX, useCallback, useMemo } from 'react';

import { type TableExportColumnConfig } from '@kubevirt-utils/hooks/useDataViewTableSort/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { exportToCSV } from '@kubevirt-utils/hooks/useTableExport';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Button, ButtonVariant, ToolbarItem, Tooltip } from '@patternfly/react-core';
import { ExportIcon } from '@patternfly/react-icons';

import ExportTableDropdown from './components/ExportTableDropdown';

type ExportTableButtonProps<TData, TCallbacks = undefined> = {
  activeColumnKeys?: string[];
  /** When true, renders as a PatternFly ToolbarItem (use inside TableToolbarActionsGroup). */
  asToolbarItem?: boolean;
  callbacks?: TCallbacks;
  columns: TableExportColumnConfig<TData, TCallbacks>[];
  data: TData[];
  filename: string;
  isDisabled?: boolean;
  loaded?: boolean;
  selectedData?: TData[];
};

const ExportTableButton = <TData, TCallbacks = undefined>({
  activeColumnKeys,
  asToolbarItem = false,
  callbacks,
  columns,
  data,
  filename,
  isDisabled,
  loaded = true,
  selectedData,
}: ExportTableButtonProps<TData, TCallbacks>): JSX.Element => {
  const { t } = useKubevirtTranslation();

  const disabled = isDisabled ?? (!loaded || isEmpty(data));
  const hasSelection = !isEmpty(selectedData);

  const exportRows = useCallback(
    (rows: TData[]) => {
      if (disabled) return;
      exportToCSV(rows, columns, filename, activeColumnKeys, callbacks);
    },
    [activeColumnKeys, callbacks, columns, disabled, filename],
  );

  const handleExportAll = useCallback(() => {
    exportRows(data);
  }, [data, exportRows]);

  const handleExportSelected = useCallback(() => {
    exportRows(selectedData ?? []);
  }, [exportRows, selectedData]);

  const tooltipContent = useMemo(() => {
    if (!loaded) {
      return t('Loading');
    }
    if (isEmpty(data)) {
      return t('No data to export');
    }
    return t('Export table data as CSV');
  }, [data, loaded, t]);

  const control = hasSelection ? (
    <ExportTableDropdown
      allCount={data.length}
      asToolbarItem={asToolbarItem}
      disabled={disabled}
      onExportAll={handleExportAll}
      onExportSelected={handleExportSelected}
      selectedCount={selectedData?.length ?? 0}
      tooltipContent={tooltipContent}
    />
  ) : (
    <Tooltip content={tooltipContent} trigger="mouseenter focus">
      <Button
        aria-label={t('Export table data to CSV')}
        className={asToolbarItem ? undefined : 'kubevirt-table-toolbar-action'}
        data-test="export-table-csv"
        icon={<ExportIcon />}
        isAriaDisabled={disabled}
        onClick={handleExportAll}
        variant={ButtonVariant.plain}
      />
    </Tooltip>
  );

  if (asToolbarItem) {
    return <ToolbarItem>{control}</ToolbarItem>;
  }

  return control;
};

export default ExportTableButton;
