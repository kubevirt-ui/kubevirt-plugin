// @ai-rules:
// 1. [Pattern]: "Can the user list ALL namespaces?" — local console: CAN_LIST_NS flag; managed cluster: fleet SSAR.
// 2. [Gotcha]: Not a proxy for "can list kubevirt.io resources cluster-wide" (CNV-101272); use a resource SSAR for that.
// 3. [Gotcha]: Hooks run unconditionally; an empty resource is skipped by useFleetAccessReview (no SSAR request).
import { NamespaceModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type K8sVerb, useFlag } from '@openshift-console/dynamic-plugin-sdk';
import { useFleetAccessReview } from '@stolostron/multicluster-sdk';

/**
 * True when the user can list namespaces cluster-wide (all projects).
 * - Without `cluster`: the CAN_LIST_NS capability flag from the console host.
 * - With `cluster`: a `list namespaces` access review on that cluster (false while pending).
 */
export const useCanListNamespaces = (cluster?: string): boolean => {
  const canListLocalNamespaces = useFlag('CAN_LIST_NS');
  // Empty resource (no cluster) makes useFleetAccessReview skip the review: no SSAR request.
  const [canListClusterNamespaces] = useFleetAccessReview({
    cluster,
    resource: cluster ? NamespaceModel.plural : '',
    verb: 'list' as K8sVerb,
  });

  if (!cluster) return canListLocalNamespaces;

  return canListClusterNamespaces;
};
