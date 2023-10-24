import { IoK8sApiBatchV1Job } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { TableColumn } from '@openshift-console/dynamic-plugin-sdk';
import { sortable } from '@patternfly/react-table';

type UseCheckupsNetworkDetailsPageHistoryColumns = () => TableColumn<IoK8sApiBatchV1Job>[];

const useCheckupsNetworkDetailsPageHistoryColumns: UseCheckupsNetworkDetailsPageHistoryColumns =
  () => {
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
        id: 'complete-time',
        sort: 'status.completionTime',
        title: t('Complete time'),
        transforms: [sortable],
      },
    ];

    return columns;
  };

export default useCheckupsNetworkDetailsPageHistoryColumns;
