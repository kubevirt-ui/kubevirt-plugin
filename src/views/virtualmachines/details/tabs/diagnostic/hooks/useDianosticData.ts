import { useMemo } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';

import { VirtualizationStatusCondition, VirtualizationVolumeSnapshotStatus } from '../utils/types';
import { conditionsTransformer, volumeSnapshotStatusesTransformer } from '../utils/utils';

type UseDiagnosticData = (vm: V1VirtualMachine) => {
  conditions: VirtualizationStatusCondition[];
  volumeSnapshotStatuses: VirtualizationVolumeSnapshotStatus[];
};

const useDiagnosticData: UseDiagnosticData = (vm) => {
  const data = useMemo(() => {
    const volumeSnapshotStatuses = volumeSnapshotStatusesTransformer(
      vm?.status?.volumeSnapshotStatuses,
    );
    const conditions = conditionsTransformer(vm?.status?.conditions);

    return { conditions, volumeSnapshotStatuses };
  }, [vm]);

  return data;
};

export default useDiagnosticData;
