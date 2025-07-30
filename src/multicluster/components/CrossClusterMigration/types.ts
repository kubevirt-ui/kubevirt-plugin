import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';

import { ProviderStorageClass } from './hooks/useProviderStorageClasses';

export type GetInitialStorageMapParams = {
  pvcs: IoK8sApiCoreV1PersistentVolumeClaim[];
  sourceStorageClasses: K8sResourceCommon[];
  targetStorageClasses: ProviderStorageClass[];
  vms: V1VirtualMachine[];
};
