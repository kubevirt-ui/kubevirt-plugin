import { ConfigMapModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import type { IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { operatorNamespaceSignal } from '@kubevirt-utils/store/operatorNamespace';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import { getGroupVersionKindForModel } from '@openshift-console/dynamic-plugin-sdk';

import useCanUpdateFeaturesConfigMap from '../useCanUpdateFeaturesConfigMap';

import { FEATURES_CONFIG_MAP_NAME } from './constants';

type UseFeaturesConfigMap = (
  cluster?: string,
  enableQuery?: boolean,
) => {
  canEditFeaturesConfigMap: boolean;
  featuresConfigMapData: [IoK8sApiCoreV1ConfigMap, boolean, Error | undefined];
};

const useFeaturesConfigMap: UseFeaturesConfigMap = (cluster, enableQuery: boolean = true) => {
  const [canEditFeaturesConfigMap] = useCanUpdateFeaturesConfigMap(cluster);
  const operatorNamespace = operatorNamespaceSignal.value;

  const featuresConfigMapData = useK8sWatchData<IoK8sApiCoreV1ConfigMap>(
    enableQuery &&
      operatorNamespace && {
        cluster,
        groupVersionKind: getGroupVersionKindForModel(ConfigMapModel),
        isList: false,
        name: FEATURES_CONFIG_MAP_NAME,
        namespace: operatorNamespace,
      },
  );
  return { canEditFeaturesConfigMap, featuresConfigMapData: [...featuresConfigMapData] };
};

export default useFeaturesConfigMap;
