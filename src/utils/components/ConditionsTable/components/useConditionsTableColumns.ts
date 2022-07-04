import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { TableColumn } from '@openshift-console/dynamic-plugin-sdk';
import { sortable } from '@patternfly/react-table';

import { K8sResourceCondition } from '../ConditionsTable';

const useConditionsTableColumns = () => {
  const { t } = useKubevirtTranslation();

  const columns: TableColumn<K8sResourceCondition>[] = [
    {
      title: t('Type'),
      id: 'type',
      transforms: [sortable],
      sort: 'type',
    },
    {
      title: t('Status'),
      id: 'status',
      transforms: [sortable],
      sort: 'status',
    },
    {
      title: t('Updated'),
      id: 'updated',
      transforms: [sortable],
      sort: 'lastTransitionTime',
    },
    {
      title: t('Reason'),
      id: 'reason',
      transforms: [sortable],
      sort: 'interface',
    },
    {
      title: t('Message'),
      id: 'message',
    },
  ];

  return columns;
};

export default useConditionsTableColumns;
