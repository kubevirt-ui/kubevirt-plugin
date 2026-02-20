import { useMemo } from 'react';

import { ConfigMapModel, modelToGroupVersionKind } from '@kubevirt-ui-ext/kubevirt-api/console';
import { IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';

import { TLS_CERT_CONFIGMAP_KEY } from '../constants';

export const useTLSCertConfigMaps = (
  namespace: string,
  cluster?: string,
): [IoK8sApiCoreV1ConfigMap[], boolean, Error] => {
  const [configMaps, loaded, error] = useK8sWatchData<IoK8sApiCoreV1ConfigMap[]>({
    cluster,
    groupVersionKind: modelToGroupVersionKind(ConfigMapModel),
    isList: true,
    namespace: namespace || undefined,
    namespaced: true,
  });

  const tlsCertConfigMaps = useMemo(() => {
    if (!namespace || !configMaps?.length) return [];
    return configMaps.filter(
      (cm) => cm?.data && Object.prototype.hasOwnProperty.call(cm.data, TLS_CERT_CONFIGMAP_KEY),
    );
  }, [namespace, configMaps]);

  return [tlsCertConfigMaps, loaded, error];
};
