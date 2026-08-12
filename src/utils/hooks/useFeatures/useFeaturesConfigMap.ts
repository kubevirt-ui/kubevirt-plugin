import { ConfigMapModel } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { DEFAULT_OPERATOR_NAMESPACE } from '@kubevirt-utils/utils/utils';
import {
  getGroupVersionKindForModel,
  K8sVerb,
  useAccessReview,
  useK8sWatchResource,
  WatchK8sResult,
} from '@openshift-console/dynamic-plugin-sdk';

import { useIsAdmin } from '../useIsAdmin';

import { FEATURES_CONFIG_MAP_NAME } from './constants';

type UseFeaturesConfigMap = () => {
  featuresConfigMapData: WatchK8sResult<IoK8sApiCoreV1ConfigMap>;
  isAdmin: boolean;
};

const useFeaturesConfigMap: UseFeaturesConfigMap = () => {
  const isAdmin = useIsAdmin();

  // Non-admins only get `watch` once the RBAC bootstrap in useFeatures.ts has run.
  const [canGetFeaturesConfigMap, canGetFeaturesConfigMapLoading] = useAccessReview({
    group: ConfigMapModel.apiGroup,
    name: FEATURES_CONFIG_MAP_NAME,
    namespace: DEFAULT_OPERATOR_NAMESPACE,
    resource: ConfigMapModel.plural,
    verb: 'watch' as K8sVerb,
  });

  const canWatch = isAdmin || (!canGetFeaturesConfigMapLoading && canGetFeaturesConfigMap);

  const featuresConfigMapData = useK8sWatchResource<IoK8sApiCoreV1ConfigMap>(
    canWatch && {
      groupVersionKind: getGroupVersionKindForModel(ConfigMapModel),
      isList: false,
      name: FEATURES_CONFIG_MAP_NAME,
      namespace: DEFAULT_OPERATOR_NAMESPACE,
    },
  );

  if (!isAdmin && canGetFeaturesConfigMapLoading) {
    return { featuresConfigMapData: [undefined, false, null], isAdmin };
  }

  if (!canWatch) {
    return { featuresConfigMapData: [undefined, true, null], isAdmin };
  }

  return { featuresConfigMapData: [...featuresConfigMapData], isAdmin };
};

export default useFeaturesConfigMap;
