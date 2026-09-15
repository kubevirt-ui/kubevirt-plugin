import { NodeModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import { K8sVerb } from '@openshift-console/dynamic-plugin-sdk';
import { useFleetAccessReview } from '@stolostron/multicluster-sdk';

const useCanListNodes = (): [boolean, boolean] => {
  const cluster = useClusterParam();

  const [canList, accessReviewLoading] = useFleetAccessReview({
    cluster,
    resource: NodeModel.plural,
    verb: 'list' as K8sVerb,
  });

  return [canList, accessReviewLoading];
};

export default useCanListNodes;
