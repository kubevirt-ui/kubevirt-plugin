import { V1VolumeSnapshotStatus } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

export type VolumeSnapshotKind = K8sResourceCommon & {
  spec: {
    source: {
      persistentVolumeClaimName?: string;
      volumeSnapshotContentName?: string;
    };
    volumeSnapshotClassName: string;
  };
  status?: V1VolumeSnapshotStatus & {
    boundVolumeSnapshotContentName?: string;
    restoreSize: string;
  };
};
