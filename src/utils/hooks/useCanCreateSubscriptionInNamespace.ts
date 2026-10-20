import { SubscriptionModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import { type K8sVerb } from '@openshift-console/dynamic-plugin-sdk';
import { useFleetAccessReview } from '@stolostron/multicluster-sdk';

type UseCanCreateSubscriptionInNamespace = (namespace?: string) => boolean;

const useCanCreateSubscriptionInNamespace: UseCanCreateSubscriptionInNamespace = (namespace) => {
  const cluster = useClusterParam();

  const accessReviewReady = Boolean(namespace);

  const [canCreate] = useFleetAccessReview(
    accessReviewReady
      ? {
          cluster,
          group: SubscriptionModel.apiGroup,
          namespace,
          resource: SubscriptionModel.plural,
          verb: 'create' as K8sVerb,
        }
      : {},
  );

  if (!accessReviewReady) {
    return false;
  }

  return canCreate;
};

export default useCanCreateSubscriptionInNamespace;
