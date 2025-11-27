import { IoK8sApiBatchV1Job } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { TableColumn } from '@openshift-console/dynamic-plugin-sdk';
import { sortable } from '@patternfly/react-table';

type UseCheckupsDetailsPageHistoryColumns = () => TableColumn<IoK8sApiBatchV1Job>[];

const useCheckupsDetailsPageHistoryColumns: UseCheckupsDetailsPageHistoryColumns = () => {
  const { t } = useKubevirtTranslation();

  const columns: TableColumn<IoK8sApiBatchV1Job>[] = [
    {
      id: 'job',
      sort: 'metadata.name',
      title: t('Job'),
      transforms: [sortable],
    },
    {
      id: 'status',
      sort: 'status.succeeded',
      title: t('Status'),
      transforms: [sortable],
    },
    {
      id: 'start-time',
      sort: 'status.startTime',
      title: t('Start time'),
      transforms: [sortable],
    },
    {
      id: 'complete-time',
      sort: 'status.completionTime',
      title: t('Complete time'),
      transforms: [sortable],
    },
    {
      id: '',
      props: { className: 'pf-v6-c-table__action' },
      title: '',
    },
  ];

  return columns;
};

export default useCheckupsDetailsPageHistoryColumns;
