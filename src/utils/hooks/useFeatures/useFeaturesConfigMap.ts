import { ConfigMapModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { OPERATOR_NAMESPACE } from '@kubevirt-utils/constants/constants';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import { getGroupVersionKindForModel, WatchK8sResult } from '@openshift-console/dynamic-plugin-sdk';

import { useIsAdmin } from '../useIsAdmin';

import { FEATURES_CONFIG_MAP_NAME } from './constants';

type UseFeaturesConfigMap = (
  cluster?: string,
  enableQuery?: boolean,
) => {
  featuresConfigMapData: WatchK8sResult<IoK8sApiCoreV1ConfigMap>;
  isAdmin: boolean;
};

const useFeaturesConfigMap: UseFeaturesConfigMap = (cluster, enableQuery: boolean = true) => {
  const isAdmin = useIsAdmin();

  const featuresConfigMapData = useK8sWatchData<IoK8sApiCoreV1ConfigMap>(
    enableQuery
      ? {
          cluster,
          groupVersionKind: getGroupVersionKindForModel(ConfigMapModel),
          isList: false,
          name: FEATURES_CONFIG_MAP_NAME,
          namespace: OPERATOR_NAMESPACE,
        }
      : null,
  );

  return { featuresConfigMapData: [...featuresConfigMapData], isAdmin };
};

export default useFeaturesConfigMap;
