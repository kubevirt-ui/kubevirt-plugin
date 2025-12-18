import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { VMQueries } from '@kubevirt-utils/components/Charts/utils/queries';
import { queriesToLink } from '@kubevirt-utils/components/Charts/utils/utils';
import useIsACMPage from '@multicluster/useIsACMPage';

import useVMQueries from './useVMQueries';

const useVMQuery = (
  vm: V1VirtualMachine | V1VirtualMachineInstance,
  queryKey: VMQueries,
): {
  query: string;
  queryLink: string;
} => {
  const isACMPage = useIsACMPage();

  const availableQueries = useVMQueries(vm);
  const query = availableQueries[queryKey];

  const queryLink = queriesToLink(query);

  return { query, queryLink: isACMPage ? null : queryLink };
};

export default useVMQuery;
