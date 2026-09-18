import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { asAccessReview } from '@kubevirt-utils/resources/shared';
import { type K8sModel, type K8sVerb } from '@openshift-console/dynamic-plugin-sdk';
import { type FleetAccessReviewResourceAttributes } from '@stolostron/multicluster-sdk';

export const asBulkAccessReview = (
  model: K8sModel,
  vms: V1VirtualMachine[],
  verb: K8sVerb,
  subresource?: string,
): FleetAccessReviewResourceAttributes | undefined => {
  const accessReview = asAccessReview(model, vms?.[0], verb, subresource);
  if (!accessReview) {
    return undefined;
  }

  if (verb === 'create') {
    const { name: _name, ...namespaceScopedReview } = accessReview;
    return namespaceScopedReview;
  }

  return accessReview;
};
