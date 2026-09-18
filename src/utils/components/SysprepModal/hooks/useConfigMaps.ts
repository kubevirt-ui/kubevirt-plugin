import { ConfigMapModel, modelToGroupVersionKind } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';

import { isSysprepConfigMap } from '../sysprep-utils';

type SysprepConfigMapsResult = [IoK8sApiCoreV1ConfigMap[] | undefined, boolean, Error | undefined];

const useSysprepConfigMaps = (namespace: string, cluster?: string): SysprepConfigMapsResult => {
  const clusterParam = useClusterParam();
  const [configmaps, configmapsLoaded, configmapsError] = useK8sWatchData<
    IoK8sApiCoreV1ConfigMap[]
  >({
    cluster: cluster ?? clusterParam,
    groupVersionKind: modelToGroupVersionKind(ConfigMapModel),
    isList: true,
    namespace,
    namespaced: true,
  });

  const sysprepConfigMaps = configmaps?.filter(isSysprepConfigMap);

  return [sysprepConfigMaps, configmapsLoaded, configmapsError];
};

export default useSysprepConfigMaps;
