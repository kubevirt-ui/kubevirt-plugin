import { useMemo } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { columnSorting } from '@virtualmachines/list/hooks/utils/utils';
import { PaginationState } from '@virtualmachines/utils';

import { DiagnosticSort } from '../utils/types';
import { conditionsTransformer, volumeSnapshotStatusesTransformer } from '../utils/utils';

const useDiagnosticData = (
  vm: V1VirtualMachine,
  sort: DiagnosticSort,
  pagination: PaginationState,
) => {
  const data = useMemo(() => {
    const volumeSnapshotStatuses = volumeSnapshotStatusesTransformer(
      vm?.status?.volumeSnapshotStatuses,
    );
    const conditions = conditionsTransformer(vm?.status?.conditions);

    const combinedData = [...conditions, ...volumeSnapshotStatuses];

    return columnSorting(combinedData, sort?.direction, pagination, sort?.column);
  }, [vm, sort, pagination]);

  return data;
};

export default useDiagnosticData;
