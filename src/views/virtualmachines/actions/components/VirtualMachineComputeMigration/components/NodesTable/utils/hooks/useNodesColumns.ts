import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { TableColumn } from '@openshift-console/dynamic-plugin-sdk';
import { sortable } from '@patternfly/react-table';
import { sortNodeColumn } from '@virtualmachines/actions/components/VirtualMachineComputeMigration/components/NodesTable/utils/utils';
import { NodeData } from '@virtualmachines/actions/components/VirtualMachineComputeMigration/utils/types';

type UseNodesColumns = () => TableColumn<NodeData>[];

const useNodesColumns: UseNodesColumns = () => {
  const { t } = useKubevirtTranslation();

  const columns: TableColumn<NodeData>[] = [
    {
      id: '',
      props: { className: 'pf-v6-c-table__action' },
      title: '',
    },
    { id: 'name', sort: 'name', title: t('Name'), transforms: [sortable] },
    { id: 'status', sort: 'status', title: t('Status'), transforms: [sortable] },
    {
      id: 'cpu',
      sort: (data, sortDirection) => sortNodeColumn(data, sortDirection, 'cpuUtilization'),
      title: t('CPU'),
      transforms: [sortable],
    },
    {
      id: 'memory',
      sort: (data, sortDirection) => sortNodeColumn(data, sortDirection, 'memoryUtilization'),
      title: t('Memory'),
      transforms: [sortable],
    },
  ];

  return columns;
};

export default useNodesColumns;
