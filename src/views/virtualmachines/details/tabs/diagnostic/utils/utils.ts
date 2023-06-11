import { v4 as uuidv4 } from 'uuid';

import {
  V1VirtualMachineCondition,
  V1VolumeSnapshotStatus,
} from '@kubevirt-ui/kubevirt-api/kubevirt';

import { VirtualizationStatusCondition, VirtualizationVolumeSnapshotStatus } from './types';

export const volumeSnapshotStatusesTransformer = (
  volumeSnapshotStatuses: V1VolumeSnapshotStatus[] = [],
): VirtualizationVolumeSnapshotStatus[] => {
  return volumeSnapshotStatuses.map((vss) => {
    const copyVSS: VirtualizationVolumeSnapshotStatus = {
      ...vss,
      metadata: { condition: 'Other', type: 'Storage' },
    };
    copyVSS.status = vss?.enabled;
    const index = vss?.reason?.indexOf(':');
    copyVSS.metadata.name = vss?.reason || vss?.name;
    if (index !== -1) {
      copyVSS.reason = vss?.reason?.slice(0, index);
      copyVSS.message = vss?.reason?.slice(index + 1, vss?.reason?.length);
      copyVSS.metadata.name = vss?.reason?.slice(0, index);
    }

    if (!copyVSS?.message) {
      copyVSS.message = copyVSS.reason;
      copyVSS.reason = copyVSS.name;
    }
    copyVSS.id = uuidv4();
    return { ...copyVSS };
  });
};

export const conditionsTransformer = (
  conditions: V1VirtualMachineCondition[] = [],
): VirtualizationStatusCondition[] => {
  return conditions?.map((condition) => {
    const id = uuidv4();
    const copyConditions: VirtualizationStatusCondition = {
      ...condition,
      id,
      metadata: {
        condition: condition?.status === 'False' ? 'Error' : 'Other',
        name: condition?.reason || condition?.type,
        type: 'VirtualMachines',
      },
    };
    return copyConditions;
  });
};
