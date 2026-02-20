import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtUserSettingsTableColumns from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettingsTableColumns';
import { modelToRef } from '@kubevirt-utils/models';
import { ApplicationAwareResourceQuotaModel } from '@kubevirt-utils/models';
import { ApplicationAwareQuota } from '@kubevirt-utils/resources/quotas/types';
import { TableColumn } from '@openshift-console/dynamic-plugin-sdk';
import { sortable, SortByDirection } from '@patternfly/react-table';

import useIsDedicatedVirtualResources from '../../hooks/useIsDedicatedVirtualResources';
import { getMainResourceKeys, getQuotaNumbers, getStatus } from '../../utils/utils';
import { QuotaColumn, QuotaScope } from '../constants';

const sortByPercentage =
  (resourceKey: string) => (data: ApplicationAwareQuota[], direction: SortByDirection) =>
    [...data].sort((a, b) => {
      const statusA = getStatus(a);
      const statusB = getStatus(b);
      const percentageA =
        getQuotaNumbers(statusA?.used?.[resourceKey], statusA?.hard?.[resourceKey])?.percentage ||
        0;
      const percentageB =
        getQuotaNumbers(statusB?.used?.[resourceKey], statusB?.hard?.[resourceKey])?.percentage ||
        0;
      return direction === SortByDirection.asc
        ? percentageA - percentageB
        : percentageB - percentageA;
    });

const useQuotasColumns = (
  namespace: string,
  scope: QuotaScope,
): [TableColumn<ApplicationAwareQuota>[], TableColumn<ApplicationAwareQuota>[], boolean] => {
  const { t } = useKubevirtTranslation();
  const isDedicatedVirtualResources = useIsDedicatedVirtualResources();

  const { cpu, memory, vmCount } = getMainResourceKeys(isDedicatedVirtualResources);

  const getNamespaceColumn = () => {
    if (scope === QuotaScope.CLUSTER) {
      return [
        {
          id: QuotaColumn.NAMESPACE,
          title: t('Namespaces'),
        },
      ];
    }
    if (namespace) {
      return [];
    }
    return [
      {
        id: QuotaColumn.NAMESPACE,
        sort: 'metadata.namespace',
        title: t('Namespace'),
        transforms: [sortable],
      },
    ];
  };

  const columns: TableColumn<ApplicationAwareQuota>[] = [
    {
      id: QuotaColumn.NAME,
      sort: 'metadata.name',
      title: t('Name'),
      transforms: [sortable],
    },
    ...getNamespaceColumn(),
    {
      id: QuotaColumn.CPU,
      sort: sortByPercentage(cpu),
      title: t('vCPU allocated'),
      transforms: [sortable],
    },
    {
      id: QuotaColumn.MEMORY,
      sort: sortByPercentage(memory),
      title: t('Memory allocated'),
      transforms: [sortable],
    },
    {
      id: QuotaColumn.VM_COUNT,
      sort: sortByPercentage(vmCount),
      title: t('VM limits'),
      transforms: [sortable],
    },
    {
      id: QuotaColumn.ADDITIONAL,
      title: t('Additional quota'),
    },
    {
      id: QuotaColumn.CREATION_TIME,
      sort: 'metadata.creationTimestamp',
      title: t('Created'),
      transforms: [sortable],
    },
    {
      id: '',
      props: { className: 'pf-v6-c-table__action' },
      title: '',
    },
  ];

  const [activeColumns, , isLoaded] = useKubevirtUserSettingsTableColumns<ApplicationAwareQuota>({
    columnManagementID: modelToRef(ApplicationAwareResourceQuotaModel),
    columns,
  });

  return [columns, activeColumns, isLoaded];
};

export default useQuotasColumns;
