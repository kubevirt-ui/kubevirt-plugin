import { IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtUserSettingsTableColumns from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettingsTableColumns';
import { TableColumn, useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';
import { sortable } from '@patternfly/react-table';

import {
  columnsSorting,
  STATUS_COMPILATION_TIME_STAMP,
  STATUS_START_TIME_STAMP,
  STATUS_SUCCEEDED,
} from '../../utils/utils';
import {
  CONFIG_PARAM_NAD_NAME,
  CONFIG_PARAM_SAMPLE_DURATION,
  CONFIG_PARAM_SOURCE_NODE,
  CONFIG_PARAM_TARGET_NODE,
  STATUS_MAX_LATENCY_NANO,
  STATUS_SOURCE_NODE,
  STATUS_TARGET_NODE,
} from '../utils/utils';

const useCheckupsNetworkCheckupsListColumns = (): [
  TableColumn<IoK8sApiCoreV1ConfigMap>[],
  TableColumn<IoK8sApiCoreV1ConfigMap>[],
  boolean,
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
      id: 'nad',
      sort: (data, sortDirection) => columnsSorting(data, sortDirection, CONFIG_PARAM_NAD_NAME),
      title: t('NetworkAttachmentDefinition'),
      transforms: [sortable],
    },
    {
      id: 'status',
      sort: (data, sortDirection) => columnsSorting(data, sortDirection, STATUS_SUCCEEDED),
      title: t('Status'),
      transforms: [sortable],
    },
    {
      id: 'latency',
      sort: (data, sortDirection) => columnsSorting(data, sortDirection, STATUS_MAX_LATENCY_NANO),
      title: t('Latency'),
      transforms: [sortable],
    },
    {
      additional: true,
      id: 'duration',
      sort: (data, sortDirection) =>
        columnsSorting(data, sortDirection, CONFIG_PARAM_SAMPLE_DURATION),
      title: t('Duration'),
      transforms: [sortable],
    },
    {
      additional: true,
      id: 'source-node',
      sort: (data, sortDirection) =>
        columnsSorting(data, sortDirection, STATUS_SOURCE_NODE, CONFIG_PARAM_SOURCE_NODE),
      title: t('Source node'),
      transforms: [sortable],
    },
    {
      additional: true,
      id: 'target-node',
      sort: (data, sortDirection) =>
        columnsSorting(data, sortDirection, STATUS_TARGET_NODE, CONFIG_PARAM_TARGET_NODE),
      title: t('Target node'),
      transforms: [sortable],
    },
    {
      additional: true,
      id: 'start-time',
      sort: (data, sortDirection) => columnsSorting(data, sortDirection, STATUS_START_TIME_STAMP),
      title: t('Start time'),
      transforms: [sortable],
    },
    {
      additional: true,
      id: 'complete-time',
      sort: (data, sortDirection) =>
        columnsSorting(data, sortDirection, STATUS_COMPILATION_TIME_STAMP),
      title: t('Complete time'),
      transforms: [sortable],
    },
    {
      id: '',
      props: { className: 'pf-v6-c-table__action' },
      title: '',
    },
  ];

  const [activeColumns, , loadedColumns] =
    useKubevirtUserSettingsTableColumns<IoK8sApiCoreV1ConfigMap>({
      columnManagementID: 'checkups-network',
      columns,
    });

  return [columns, activeColumns, loadedColumns];
};

export default useCheckupsNetworkCheckupsListColumns;
