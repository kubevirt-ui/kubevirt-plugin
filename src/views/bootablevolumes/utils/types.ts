import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubernetes';

export type BootableVolumeMetadata = {
  labels: { [key: string]: string };
  annotations: { [key: string]: string };
};

export type BootableResource = V1beta1DataSource | IoK8sApiCoreV1PersistentVolumeClaim;
