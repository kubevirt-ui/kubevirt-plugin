import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { modelToGroupVersionKind, PersistentVolumeClaimModel } from '@kubevirt-utils/models';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';

// Prefer VM.cluster on ACM so the PVC watch targets the spoke (CNV-84270).
const usePVCDiskSource = (pvcName: string, pvcNamespace: string, vmCluster?: string) => {
  const clusterParam = useClusterParam();
  const cluster = vmCluster ?? clusterParam;

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
