import { ConfigMapModel, RoleBindingModel, RoleModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import {
  IoK8sApiCoreV1ConfigMap,
  IoK8sApiRbacV1Role,
  IoK8sApiRbacV1RoleBinding,
} from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { operatorNamespaceSignal } from '@kubevirt-utils/store/operatorNamespace';
import { DEFAULT_OPERATOR_NAMESPACE } from '@kubevirt-utils/utils/utils';
import { kubevirtK8sCreate, kubevirtK8sPatch } from '@multicluster/k8sRequests';

import {
  FEATURES_CONFIG_MAP_INITIAL_DATA,
  getFeaturesConfigMapInitialState,
  getFeaturesRole,
  getFeaturesRoleBinding,
} from './constants';

export const createFeaturesConfigMap = async (cluster?: string) => {
  const namespace = operatorNamespaceSignal.value ?? DEFAULT_OPERATOR_NAMESPACE;

  await kubevirtK8sCreate<IoK8sApiCoreV1ConfigMap>({
    cluster,
    data: getFeaturesConfigMapInitialState(namespace),
    model: ConfigMapModel,
  });

  await kubevirtK8sCreate<IoK8sApiRbacV1Role>({
    cluster,
    data: getFeaturesRole(namespace),
    model: RoleModel,
  });

  await kubevirtK8sCreate<IoK8sApiRbacV1RoleBinding>({
    cluster,
    data: getFeaturesRoleBinding(namespace),
    model: RoleBindingModel,
  });
};

export const applyMissingFeatures = async (
  featureName: string,
  featureConfigMap: IoK8sApiCoreV1ConfigMap,
  cluster?: string,
) => {
  await kubevirtK8sPatch({
    cluster,
    data: [
      {
        op: 'replace',
        path: `/data/${featureName}`,
        value: FEATURES_CONFIG_MAP_INITIAL_DATA[featureName],
      },
    ],
    model: ConfigMapModel,
    resource: featureConfigMap,
  });
};
