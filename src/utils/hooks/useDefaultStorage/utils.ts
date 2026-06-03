import { IoK8sApiStorageV1StorageClass } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';

import {
  DEFAULT_STORAGE_CLASS_ANNOTATION,
  DEFAULT_VIRT_STORAGE_CLASS_ANNOTATION,
} from './constants';

type DefaultStorageClasses = {
  clusterDefaultStorageClass: IoK8sApiStorageV1StorageClass;
  virtDefaultStorageClass: IoK8sApiStorageV1StorageClass;
};

export const isDefaultStorageClass = (storageClass: IoK8sApiStorageV1StorageClass): boolean =>
  storageClass?.metadata?.annotations?.[DEFAULT_STORAGE_CLASS_ANNOTATION] === 'true';

export const isVirtDefaultStorageClass = (storageClass: IoK8sApiStorageV1StorageClass): boolean =>
  storageClass?.metadata?.annotations?.[DEFAULT_VIRT_STORAGE_CLASS_ANNOTATION] === 'true';

export const getPreferredDefaultStorageClass = ({
  clusterDefaultStorageClass,
  virtDefaultStorageClass,
}: DefaultStorageClasses): IoK8sApiStorageV1StorageClass =>
  virtDefaultStorageClass || clusterDefaultStorageClass;
