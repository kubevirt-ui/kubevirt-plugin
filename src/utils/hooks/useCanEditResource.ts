import { asAccessReview } from '@kubevirt-utils/resources/shared';
import {
  type K8sModel,
  type K8sResourceCommon,
  type K8sVerb,
} from '@openshift-console/dynamic-plugin-sdk';
import { useFleetAccessReview } from '@stolostron/multicluster-sdk';

type UseCanEditResource = (
  model: K8sModel | undefined,
  obj: K8sResourceCommon | undefined,
  verb?: K8sVerb,
) => [boolean, boolean];

const useCanEditResource: UseCanEditResource = (model, obj, verb = 'update') => {
  const accessReview = model && obj ? asAccessReview(model, obj, verb) : null;
  const [canEdit, loading] = useFleetAccessReview(accessReview ?? {});

  if (!accessReview) {
    return [false, false];
  }

  return [canEdit, loading];
};

export default useCanEditResource;
