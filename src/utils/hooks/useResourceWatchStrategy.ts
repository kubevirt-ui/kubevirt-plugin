// @ai-rules:
// 1. [Pattern]: Single source of truth for "watch cluster-wide vs per-namespace" decisions (CNV-101272).
// 2. [Gotcha]: `resolved` is false until the strategy is known — callers must not report loaded before.
// 3. [Gotcha]: Decide on a resource-level `list` review for the watched kind, never on the namespaces check
//    (CAN_LIST_NS / useCanListNamespaces): roles like acm-vm-extended:view can list namespaces cluster-wide
//    but have no cluster-wide kubevirt.io rules, so a cluster-wide watch would hard-fail with 403.
// 4. [Pattern]: No per-namespace SSAR fan-out. Users denied the cluster-wide list fall back to per-namespace
//    watches over their projects; callers ignore the resulting per-namespace 403s (getFirstNonForbiddenError).
import {
  type K8sGroupVersionKind,
  type K8sVerb,
  useK8sModel,
} from '@openshift-console/dynamic-plugin-sdk';
import { useFleetAccessReview } from '@stolostron/multicluster-sdk';

type UseResourceWatchStrategyArgs = {
  cluster?: string;
  enabled: boolean;
  groupVersionKind: K8sGroupVersionKind;
  namespace?: string;
  /** True once the list of candidate namespaces (usually the user's projects) is known. */
  namespacesLoaded: boolean;
};

export type ResourceWatchStrategy = {
  clusterWide: boolean;
  perNamespace: boolean;
  resolved: boolean;
};

const useResourceWatchStrategy = ({
  cluster,
  enabled,
  groupVersionKind,
  namespace,
  namespacesLoaded,
}: UseResourceWatchStrategyArgs): ResourceWatchStrategy => {
  const [model, modelInFlight] = useK8sModel(groupVersionKind);

  // CNV-101272: list permission on the resource itself. Empty group + resource skips the review
  // (useFleetAccessReview sends no SSAR request) while disabled or the model is unresolved.
  const resource = enabled && model ? model.plural : '';
  const group = resource ? (groupVersionKind.group ?? '') : '';
  const [canListResource, resourceAccessLoading] = useFleetAccessReview({
    cluster,
    group,
    namespace,
    resource,
    verb: 'list' as K8sVerb,
  });
  const canListClusterWide = Boolean(resource) && canListResource;
  const accessResolved = !enabled || (!modelInFlight && !(resource && resourceAccessLoading));

  const clusterWide = enabled && accessResolved && canListClusterWide;
  const perNamespace = enabled && accessResolved && namespacesLoaded && !canListClusterWide;

  return {
    clusterWide,
    perNamespace,
    resolved: !enabled || clusterWide || perNamespace,
  };
};

export default useResourceWatchStrategy;
