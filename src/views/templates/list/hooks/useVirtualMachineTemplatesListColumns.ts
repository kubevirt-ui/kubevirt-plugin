import { useMemo } from 'react';

import { modelToRef, TemplateModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type ColumnLayout } from '@kubevirt-utils/components/KubevirtTable/types';
import { buildColumnLayout } from '@kubevirt-utils/components/KubevirtTable/utils';
import { type ColumnConfig } from '@kubevirt-utils/hooks/useDataViewTableSort/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtUserSettingsTableColumns from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettingsTableColumns';
import { type TemplateOrRequest } from '@kubevirt-utils/resources/template/utils';

import { getTemplateColumns } from '../virtualMachineTemplatesDefinition';

type UseVirtualMachineTemplatesListColumnsResult = {
  activeColumnKeys: string[];
  columnLayout: ColumnLayout;
  columns: ColumnConfig<TemplateOrRequest>[];
  loadedColumns: boolean;
};

const useVirtualMachineTemplatesListColumns = (
  namespace: string,
  isAllClustersPage: boolean,
): UseVirtualMachineTemplatesListColumnsResult => {
  const { t } = useKubevirtTranslation();

  const columns = useMemo(
    () => getTemplateColumns(t, namespace, isAllClustersPage),
    [t, namespace, isAllClustersPage],
  );

  const manageableColumns = useMemo(() => columns.filter((col) => col.label), [columns]);

  const [activeColumns, , loadedColumns] = useKubevirtUserSettingsTableColumns<TemplateOrRequest>({
    columnManagementID: modelToRef(TemplateModel),
    columns: manageableColumns.map((col) => ({
      additional: col.additional,
      id: col.key,
      props: col.props,
      title: col.label,
    })),
  });

  const activeColumnKeys = useMemo(
    () => activeColumns?.map((col) => col?.id) ?? manageableColumns.map((col) => col.key),
    [activeColumns, manageableColumns],
  );

  const columnLayout = useMemo(
    () => buildColumnLayout(manageableColumns, activeColumnKeys, modelToRef(TemplateModel)),
    [manageableColumns, activeColumnKeys],
  );

  return { activeColumnKeys, columnLayout, columns, loadedColumns };
};

export default useVirtualMachineTemplatesListColumns;
