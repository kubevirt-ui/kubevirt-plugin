import { modelToGroupVersionKind } from '@kubevirt-ui-ext/kubevirt-api/console';
import { IoK8sApiStorageV1StorageClass } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { StorageClassModel } from '@kubevirt-utils/models';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';

type UseStorageClasses = (cluster?: string) => [IoK8sApiStorageV1StorageClass[], boolean];

const useStorageClasses: UseStorageClasses = (cluster) => {
  const clusterParam = useClusterParam();

  const [storageClasses, loaded] = useK8sWatchData<IoK8sApiStorageV1StorageClass[]>({
    cluster: cluster || clusterParam,
    groupVersionKind: modelToGroupVersionKind(StorageClassModel),
    isList: true,
  });

  return [storageClasses, loaded];
};

export default useStorageClasses;
