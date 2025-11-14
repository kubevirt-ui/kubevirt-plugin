import { modelToRef } from '@kubevirt-ui/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtUserSettingsTableColumns from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettingsTableColumns';
import { ApplicationAwareResourceQuotaModel } from '@kubevirt-utils/models';
import { K8sResourceCommon, TableColumn } from '@openshift-console/dynamic-plugin-sdk';
import { sortable } from '@patternfly/react-table';

import { QuotaColumn } from '../constants';

const useQuotasColumns = (
  namespace: string,
): [TableColumn<K8sResourceCommon>[], TableColumn<K8sResourceCommon>[], boolean] => {
  const { t } = useKubevirtTranslation();

  const columns = [
    {
      id: QuotaColumn.NAME,
      //props: { className: 'pf-m-width-20' },
      sort: 'metadata.name',
      title: t('Name'),
      transforms: [sortable],
    },
    ...(!namespace
      ? [
          {
            id: QuotaColumn.NAMESPACE,
            sort: 'metadata.namespace', // TODO: use label selectors for cluster wide probably
            title: t('Namespace'),
            transforms: [sortable],
          },
        ]
      : []),
    {
      id: QuotaColumn.CPU,
      sort: 'spec.hard.requests.cpu/vmi',
      title: t('CPU limits'),
      transforms: [sortable],
    },
    {
      id: QuotaColumn.MEMORY,
      sort: 'spec.hard.requests.memory/vmi',
      title: t('Memory limits'),
      transforms: [sortable],
    },
    {
      id: QuotaColumn.VM_COUNT,
      sort: 'spec.hard.count/virtualmachines.kubevirt.io',
      title: t('VM limits'),
      transforms: [sortable],
    },
    {
      id: '',
      props: { className: 'pf-v6-c-table__action' },
      title: '',
    },
  ];

  const [activeColumns, , isLoaded] = useKubevirtUserSettingsTableColumns<K8sResourceCommon>({
    columnManagementID: modelToRef(ApplicationAwareResourceQuotaModel),
    columns,
  });

  return [columns, activeColumns, isLoaded];
};

export default useQuotasColumns;
