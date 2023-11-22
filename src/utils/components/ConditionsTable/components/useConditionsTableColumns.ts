import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { TableColumn } from '@openshift-console/dynamic-plugin-sdk';
import { sortable } from '@patternfly/react-table';

import { K8sResourceCondition } from '../ConditionsTable';

const useConditionsTableColumns = () => {
  const { t } = useKubevirtTranslation();

  const columns: TableColumn<K8sResourceCondition>[] = [
    {
      id: 'type',
      sort: 'type',
      title: t('Type'),
      transforms: [sortable],
    },
    {
      id: 'status',
      sort: 'status',
      title: t('Status'),
      transforms: [sortable],
    },
    {
      id: 'updated',
      sort: 'lastTransitionTime',
      title: t('Updated'),
      transforms: [sortable],
    },
    {
      id: 'reason',
      sort: 'interface',
      title: t('Reason'),
      transforms: [sortable],
    },
    {
      id: 'message',
      title: t('Message'),
    },
  ];

  return columns;
};

export default useConditionsTableColumns;
