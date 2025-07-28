import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';

export type GetInitialStorageMapParams = {
  pvcs: IoK8sApiCoreV1PersistentVolumeClaim[];
  sourceStorageClasses: K8sResourceCommon[];
  targetStorageClasses: K8sResourceCommon[];
  vms: V1VirtualMachine[];
};
