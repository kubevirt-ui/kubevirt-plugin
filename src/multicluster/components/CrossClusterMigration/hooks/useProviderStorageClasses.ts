import { IoK8sApiStorageV1StorageClass } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { modelToGroupVersionKind, StorageClassModel } from '@kubevirt-utils/models';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';

const useProviderStorageClasses = (cluster: string) => {
  const [data, loaded, error] = useK8sWatchData<IoK8sApiStorageV1StorageClass[]>({
    cluster,
    groupVersionKind: modelToGroupVersionKind(StorageClassModel),
    isList: true,
  });

  return { data, error, loaded };
};

export default useProviderStorageClasses;
