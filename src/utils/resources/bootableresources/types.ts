import type { V1beta1DataSource } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import type { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';

export type BootableVolume = IoK8sApiCoreV1PersistentVolumeClaim | V1beta1DataSource;
