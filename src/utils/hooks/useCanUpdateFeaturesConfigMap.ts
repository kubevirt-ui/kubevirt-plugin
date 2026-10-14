import { ConfigMapModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { operatorNamespaceSignal } from '@kubevirt-utils/store/operatorNamespace';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import { type K8sVerb } from '@openshift-console/dynamic-plugin-sdk';
import { useFleetAccessReview } from '@stolostron/multicluster-sdk';

import { FEATURES_CONFIG_MAP_NAME } from './useFeatures/constants';

type UseCanUpdateFeaturesConfigMap = (cluster?: string) => [boolean, boolean];

const useCanUpdateFeaturesConfigMap: UseCanUpdateFeaturesConfigMap = (clusterOverride) => {
  const clusterParam = useClusterParam();
  const cluster = clusterOverride ?? clusterParam;
  const operatorNamespace = operatorNamespaceSignal.value;

  const accessReviewReady = Boolean(operatorNamespace);

  const [canPatch, accessReviewLoading] = useFleetAccessReview(
    accessReviewReady
      ? {
          cluster,
          group: ConfigMapModel.apiGroup,
          name: FEATURES_CONFIG_MAP_NAME,
          namespace: operatorNamespace,
          resource: ConfigMapModel.plural,
          verb: 'patch' as K8sVerb,
        }
      : {},
  );

  const loading = !operatorNamespace || accessReviewLoading;

  if (!accessReviewReady) {
    return [false, loading];
  }

  return [canPatch, loading];
};

export default useCanUpdateFeaturesConfigMap;
