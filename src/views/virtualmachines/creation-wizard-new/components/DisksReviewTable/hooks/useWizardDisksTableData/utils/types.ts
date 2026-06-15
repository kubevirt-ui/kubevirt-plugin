import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { V1DataVolumeTemplateSpec, V1Disk, V1Volume } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';

export type DiskDevice = {
  dataVolumeTemplate: V1DataVolumeTemplateSpec;
  disk: V1Disk;
  pvc: IoK8sApiCoreV1PersistentVolumeClaim;
  volume: V1Volume;
};
