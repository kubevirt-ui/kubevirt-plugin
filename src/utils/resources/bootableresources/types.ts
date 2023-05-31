import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubernetes';

export type BootableVolume = V1beta1DataSource | IoK8sApiCoreV1PersistentVolumeClaim;
