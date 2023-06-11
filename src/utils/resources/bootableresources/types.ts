import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubernetes';

export type BootableVolume = IoK8sApiCoreV1PersistentVolumeClaim | V1beta1DataSource;
