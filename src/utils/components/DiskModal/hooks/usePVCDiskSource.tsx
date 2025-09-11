import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { modelToGroupVersionKind, PersistentVolumeClaimModel } from '@kubevirt-utils/models';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';

const usePVCDiskSource = (pvcName: string, pvcNamespace: string) => {
  const cluster = useClusterParam();

  return useK8sWatchData<IoK8sApiCoreV1PersistentVolumeClaim>(
    pvcName
      ? {
          cluster,
          groupVersionKind: modelToGroupVersionKind(PersistentVolumeClaimModel),
          name: pvcName,
          namespace: pvcNamespace,
        }
      : null,
  );
};

export default usePVCDiskSource;
