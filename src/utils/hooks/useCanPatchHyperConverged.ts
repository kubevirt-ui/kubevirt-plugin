import { KUBEVIRT_HYPERCONVERGED } from '@kubevirt-utils/constants/constants';
import useHyperConvergedModel from '@kubevirt-utils/resources/hyperconverged/hooks/useHyperConvergedModel';
import { operatorNamespaceSignal } from '@kubevirt-utils/store/operatorNamespace';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import { type K8sVerb } from '@openshift-console/dynamic-plugin-sdk';
import { useFleetAccessReview } from '@stolostron/multicluster-sdk';

type UseCanPatchHyperConverged = (cluster?: string) => [boolean, boolean];

const useCanPatchHyperConverged: UseCanPatchHyperConverged = (clusterOverride) => {
  const clusterParam = useClusterParam();
  const cluster = clusterOverride ?? clusterParam;
  const operatorNamespace = operatorNamespaceSignal.value;
  const { loading: modelLoading, model } = useHyperConvergedModel(cluster);

  const accessReviewReady = Boolean(operatorNamespace) && !modelLoading;

  const [canPatch, accessReviewLoading] = useFleetAccessReview(
    accessReviewReady
      ? {
          cluster,
          group: model.apiGroup,
          name: KUBEVIRT_HYPERCONVERGED,
          namespace: operatorNamespace,
          resource: model.plural,
          verb: 'patch' as K8sVerb,
        }
      : {},
  );

  const loading = modelLoading || accessReviewLoading;

  if (!accessReviewReady) {
    return [false, loading];
  }

  return [canPatch, loading];
};

export default useCanPatchHyperConverged;
