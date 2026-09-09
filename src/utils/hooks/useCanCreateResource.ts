import { type K8sModel } from '@openshift-console/dynamic-plugin-sdk';
import { useFleetAccessReview } from '@stolostron/multicluster-sdk';

type UseCanCreateResourceProps = {
  cluster?: string;
  model: K8sModel;
  namespace?: string;
};

const useCanCreateResource = ({
  cluster,
  model,
  namespace,
}: UseCanCreateResourceProps): boolean => {
  const [canCreateResource] = useFleetAccessReview({
    cluster,
    group: model.apiGroup,
    namespace,
    resource: model.plural,
    verb: 'create',
  });

  return canCreateResource;
};

export default useCanCreateResource;
