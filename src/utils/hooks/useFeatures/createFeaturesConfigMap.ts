import { ConfigMapModel, RoleBindingModel, RoleModel } from '@kubevirt-ui/kubevirt-api/console';
import {
  IoK8sApiCoreV1ConfigMap,
  IoK8sApiRbacV1Role,
  IoK8sApiRbacV1RoleBinding,
} from '@kubevirt-ui/kubevirt-api/kubernetes';
import { operatorNamespaceSignal } from '@kubevirt-utils/store/operatorNamespace';
import { DEFAULT_OPERATOR_NAMESPACE } from '@kubevirt-utils/utils/utils';
import { k8sCreate, k8sPatch } from '@openshift-console/dynamic-plugin-sdk';

import {
  FEATURES_CONFIG_MAP_INITIAL_DATA,
  getFeaturesConfigMapInitialState,
  getFeaturesRole,
  getFeaturesRoleBinding,
} from './constants';

export const createFeaturesConfigMap = async () => {
  const namespace = operatorNamespaceSignal.value ?? DEFAULT_OPERATOR_NAMESPACE;

  await k8sCreate<IoK8sApiCoreV1ConfigMap>({
    data: getFeaturesConfigMapInitialState(namespace),
    model: ConfigMapModel,
  });

  await k8sCreate<IoK8sApiRbacV1Role>({
    data: getFeaturesRole(namespace),
    model: RoleModel,
  });

  await k8sCreate<IoK8sApiRbacV1RoleBinding>({
    data: getFeaturesRoleBinding(namespace),
    model: RoleBindingModel,
  });
};

export const applyMissingFeatures = async (
  featureName: string,
  featureConfigMap: IoK8sApiCoreV1ConfigMap,
) => {
  await k8sPatch({
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
