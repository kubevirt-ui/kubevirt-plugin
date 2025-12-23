import { ConfigMapModel, modelToGroupVersionKind } from '@kubevirt-ui-ext/kubevirt-api/console';
import { IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import { WatchK8sResult } from '@openshift-console/dynamic-plugin-sdk';

import { AUTOUNATTEND, UNATTEND } from '../sysprep-utils';

const checkEqualCaseInsensitive = (a: string, b: string) =>
  a.localeCompare(b, 'en', { sensitivity: 'base' }) === 0; // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/localeCompare

const useSysprepConfigMaps = (
  namespace: string,
  cluster?: string,
): WatchK8sResult<IoK8sApiCoreV1ConfigMap[]> => {
  const clusterParam = useClusterParam();
  const [configmaps, configmapsLoaded, configmapsError] = useK8sWatchData<
    IoK8sApiCoreV1ConfigMap[]
  >({
    cluster: cluster || clusterParam,
    groupVersionKind: modelToGroupVersionKind(ConfigMapModel),
    isList: true,
    namespace,
    namespaced: true,
  });

  const sysprepConfigMaps = configmaps?.filter((configmap) => {
    if (isEmpty(configmap?.data)) return false;

    const dataKeys = Object.keys(configmap?.data);
    const hasSysprepXMLData = dataKeys.some((key) => {
      return (
        checkEqualCaseInsensitive(key, UNATTEND) || checkEqualCaseInsensitive(key, AUTOUNATTEND)
      );
    });
    return hasSysprepXMLData;
  });

  return [sysprepConfigMaps, configmapsLoaded, configmapsError];
};

export default useSysprepConfigMaps;
