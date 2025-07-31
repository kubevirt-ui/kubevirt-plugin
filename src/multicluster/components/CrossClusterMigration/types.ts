import {
  IoK8sApiCoreV1PersistentVolumeClaim,
  IoK8sApiStorageV1StorageClass,
} from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';

export type GetInitialStorageMapParams = {
  pvcs: IoK8sApiCoreV1PersistentVolumeClaim[];
  sourceStorageClasses: IoK8sApiStorageV1StorageClass[];
  targetStorageClasses: IoK8sApiStorageV1StorageClass[];
  vms: V1VirtualMachine[];
};
