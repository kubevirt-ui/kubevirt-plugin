import { ConfigMapModel } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtUserSettingsTableColumns from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettingsTableColumns';
import { TableColumn, useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';
import { sortable, SortByDirection } from '@patternfly/react-table';

import {
  columnsSorting,
  STATUS_COMPILATION_TIME_STAMP,
  STATUS_FAILURE_REASON,
  STATUS_START_TIME_STAMP,
  STATUS_SUCCEEDED,
} from './../../../utils/utils';

const useCheckupsStorageListColumns = (): [
  TableColumn<IoK8sApiCoreV1ConfigMap>[],
  TableColumn<IoK8sApiCoreV1ConfigMap>[],
] => {
  const [namespace] = useActiveNamespace();
  const { t } = useKubevirtTranslation();

  const columns: TableColumn<IoK8sApiCoreV1ConfigMap>[] = [
    {
      id: 'name',
      sort: 'metadata.name',
      title: t('Name'),
      transforms: [sortable],
    },
    ...(namespace === ALL_NAMESPACES_SESSION_KEY
      ? [
          {
            id: 'namespace',
            sort: 'metadata.namespace',
            title: t('Namespace'),
            transforms: [sortable],
          },
        ]
      : []),
    {
      id: 'status',
      sort: (data: IoK8sApiCoreV1ConfigMap[], sortDirection: SortByDirection) =>
        columnsSorting(data, sortDirection, STATUS_SUCCEEDED),
      title: t('Status'),
      transforms: [sortable],
    },
    {
      id: 'failure',
      sort: (data: IoK8sApiCoreV1ConfigMap[], sortDirection: SortByDirection) =>
        columnsSorting(data, sortDirection, STATUS_FAILURE_REASON),
      title: t('Failure reason'),
      transforms: [sortable],
    },
    {
      id: 'start-time',
      sort: (data: IoK8sApiCoreV1ConfigMap[], sortDirection: SortByDirection) =>
        columnsSorting(data, sortDirection, STATUS_START_TIME_STAMP),
      title: t('Start time'),
      transforms: [sortable],
    },
    {
      id: 'complete-time',
      sort: (data: IoK8sApiCoreV1ConfigMap[], sortDirection: SortByDirection) =>
        columnsSorting(data, sortDirection, STATUS_COMPILATION_TIME_STAMP),
      title: t('Completion time'),
      transforms: [sortable],
    },
    {
      id: '',
      props: { className: 'dropdown-kebab-pf pf-c-table__action' },
      title: '',
    },
  ];

  const [activeColumns] = useKubevirtUserSettingsTableColumns<IoK8sApiCoreV1ConfigMap>({
    columnManagementID: ConfigMapModel.kind,
    columns,
  });

  return [columns, activeColumns];
};

export default useCheckupsStorageListColumns;
