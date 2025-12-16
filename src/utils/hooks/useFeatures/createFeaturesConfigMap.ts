import { ConfigMapModel, RoleBindingModel, RoleModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import {
  IoK8sApiCoreV1ConfigMap,
  IoK8sApiRbacV1Role,
  IoK8sApiRbacV1RoleBinding,
} from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { k8sCreate, k8sPatch } from '@openshift-console/dynamic-plugin-sdk';

import { featuresConfigMapInitialState, featuresRole, featuresRoleBinding } from './constants';

export const createFeaturesConfigMap = async () => {
  await k8sCreate<IoK8sApiCoreV1ConfigMap>({
    data: featuresConfigMapInitialState,
    model: ConfigMapModel,
  });

  await k8sCreate<IoK8sApiRbacV1Role>({
    data: featuresRole,
    model: RoleModel,
  });

  await k8sCreate<IoK8sApiRbacV1RoleBinding>({
    data: featuresRoleBinding,
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
        value: featuresConfigMapInitialState.data[featureName],
      },
    ],
    model: ConfigMapModel,
    resource: featureConfigMap,
  });
};
