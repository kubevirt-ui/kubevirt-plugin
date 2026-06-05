import React, { useCallback, useMemo } from 'react';

import { ColumnConfig } from '@kubevirt-utils/hooks/useDataViewTableSort/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { exportToCSV } from '@kubevirt-utils/hooks/useTableExport';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Button, ButtonVariant, ToolbarItem, Tooltip } from '@patternfly/react-core';
import { ExportIcon } from '@patternfly/react-icons';

type ExportTableButtonProps<TData, TCallbacks = undefined> = {
  activeColumnKeys?: string[];
  /** When true, renders as a PatternFly ToolbarItem (use inside TableToolbarActionsGroup). */
  asToolbarItem?: boolean;
  callbacks?: TCallbacks;
  columns: ColumnConfig<TData, TCallbacks>[];
  data: TData[];
  filename: string;
  isDisabled?: boolean;
  loaded?: boolean;
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
}: ExportTableButtonProps<TData, TCallbacks>) => {
  const { t } = useKubevirtTranslation();

  const disabled = isDisabled ?? (!loaded || isEmpty(data));

  const handleExport = useCallback(() => {
    if (disabled) return;
    exportToCSV(data, columns, filename, activeColumnKeys, callbacks);
  }, [activeColumnKeys, callbacks, columns, data, disabled, filename]);

  const tooltipContent = useMemo(() => {
    if (!loaded) {
      return t('Loading');
    }
    if (isEmpty(data)) {
      return t('No data to export');
    }
    return t('Export table data as CSV');
  }, [data, loaded, t]);

  const button = (
    <Tooltip content={tooltipContent} trigger="mouseenter focus">
      <Button
        aria-label={t('Export table data to CSV')}
        className={asToolbarItem ? undefined : 'kubevirt-table-toolbar-action'}
        data-test="export-table-data"
        icon={<ExportIcon />}
        isAriaDisabled={disabled}
        onClick={handleExport}
        variant={ButtonVariant.plain}
      />
    </Tooltip>
  );

  if (asToolbarItem) {
    return <ToolbarItem>{button}</ToolbarItem>;
  }

  return button;
};

export default ExportTableButton;
