import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { modelToGroupVersionKind, PersistentVolumeClaimModel } from '@kubevirt-utils/models';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

const usePVCDiskSource = (pvcName: string, pvcNamespace: string) =>
  useK8sWatchResource<IoK8sApiCoreV1PersistentVolumeClaim>(
    pvcName
      ? {
          groupVersionKind: modelToGroupVersionKind(PersistentVolumeClaimModel),
          name: pvcName,
          namespace: pvcNamespace,
        }
      : null,
  );

export default usePVCDiskSource;
