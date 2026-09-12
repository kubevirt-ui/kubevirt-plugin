import { getCluster } from '@multicluster/helpers/selectors';
import {
  type K8sModel,
  type K8sResourceCommon,
  type K8sVerb,
} from '@openshift-console/dynamic-plugin-sdk';
import { type FleetAccessReviewResourceAttributes } from '@stolostron/multicluster-sdk';

export const asAccessReview = (
  model: K8sModel,
  obj: K8sResourceCommon,
  verb: K8sVerb,
  subresource?: string,
): FleetAccessReviewResourceAttributes | null => {
  if (!obj) {
    return null;
  }
  return {
    cluster: getCluster(obj),
    group: model.apiGroup,
    name: obj?.metadata?.name,
    namespace: obj?.metadata?.namespace,
    resource: model.plural,
    subresource,
    verb,
  };
};

export const getAPIVersionForModel = (model: K8sModel): string =>
  !model?.apiGroup ? model.apiVersion : `${model.apiGroup}/${model.apiVersion}`;
