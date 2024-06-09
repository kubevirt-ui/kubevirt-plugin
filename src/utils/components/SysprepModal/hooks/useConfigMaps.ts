import { ConfigMapModel, modelToGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { useK8sWatchResource, WatchK8sResult } from '@openshift-console/dynamic-plugin-sdk';

import { AUTOUNATTEND, UNATTEND } from '../sysprep-utils';

const checkEqualCaseInsensitive = (a: string, b: string) =>
  a.localeCompare(b, 'en', { sensitivity: 'base' }) === 0; // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/localeCompare

const useSysprepConfigMaps = (namespace: string): WatchK8sResult<IoK8sApiCoreV1ConfigMap[]> => {
  const [configmaps, configmapsLoaded, configmapsError] = useK8sWatchResource<
    IoK8sApiCoreV1ConfigMap[]
  >({
    groupVersionKind: modelToGroupVersionKind(ConfigMapModel),
    isList: true,
    namespace,
    namespaced: true,
  });
  const sysprepConfigMaps = configmaps?.filter((configmap) => {
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
