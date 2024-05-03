import { ConfigMapModel, modelToGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { useK8sWatchResource, WatchK8sResult } from '@openshift-console/dynamic-plugin-sdk';

import { AUTOUNATTEND, UNATTEND } from '../sysprep-utils';

const useSysprepConfigMaps = (namespace: string): WatchK8sResult<IoK8sApiCoreV1ConfigMap[]> => {
  const [configmaps, configmapsLoaded, configmapsError] = useK8sWatchResource<
    IoK8sApiCoreV1ConfigMap[]
  >({
    groupVersionKind: modelToGroupVersionKind(ConfigMapModel),
    isList: true,
    namespace,
    namespaced: true,
  });
  const sysprepConfigMaps = configmaps?.filter(
    (configmap) => configmap?.data?.[AUTOUNATTEND] || configmap?.data?.[UNATTEND],
  );

  return [sysprepConfigMaps, configmapsLoaded, configmapsError];
};

export default useSysprepConfigMaps;
