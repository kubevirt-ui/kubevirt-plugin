// @ai-rules:
// 1. [Pattern]: Single source of truth for "watch cluster-wide vs per-namespace" decisions (CNV-101272).
// 2. [Gotcha]: `resolved` is false until the strategy is known — callers must not report loaded before.
// 3. [Gotcha]: Namespace narrowing only runs for mixed RBAC (can list namespaces, resource list denied),
//    so namespace-only users keep the pre-existing behavior with no extra access reviews.
// 4. [Gotcha]: Both reviews target the same `cluster`: useCanListNamespaces(cluster) for namespaces and a
//    resource-level `list` review for the watched kind. Never use the namespaces check for the watch scope.
import { useCanListNamespaces } from '@kubevirt-utils/hooks/useCanListNamespaces';
import {
  type K8sGroupVersionKind,
  type K8sVerb,
  useK8sModel,
} from '@openshift-console/dynamic-plugin-sdk';
import { useFleetAccessReview } from '@stolostron/multicluster-sdk';

import useNamespacesWithListAccess from './useNamespacesWithListAccess';

type UseResourceWatchStrategyArgs = {
  cluster?: string;
  enabled: boolean;
  groupVersionKind: K8sGroupVersionKind;
  namespace?: string;
  /** Candidate namespaces for per-namespace watches (usually the user's projects). */
  namespaces: string[];
  namespacesLoaded: boolean;
  /** Set false when the caller passes an explicit namespace list that must not be narrowed. */
  narrowNamespaces?: boolean;
};

export type ResourceWatchStrategy = {
  clusterWide: boolean;
  namespaces: string[];
  perNamespace: boolean;
  resolved: boolean;
};

const useResourceWatchStrategy = ({
  cluster,
  enabled,
  groupVersionKind,
  namespace,
  namespaces,
  namespacesLoaded,
  narrowNamespaces = true,
}: UseResourceWatchStrategyArgs): ResourceWatchStrategy => {
  const canListAllNamespaces = useCanListNamespaces(cluster);
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

  const narrow =
    enabled && accessResolved && narrowNamespaces && canListAllNamespaces && !canListClusterWide;
  const [allowedNamespaces, allowedNamespacesLoaded] = useNamespacesWithListAccess(
    { group, resource },
    namespaces,
    accessResolved && namespacesLoaded && narrow,
  );

  const clusterWide = enabled && accessResolved && canListClusterWide;
  const perNamespace =
    enabled &&
    accessResolved &&
    namespacesLoaded &&
    !canListClusterWide &&
    (!narrow || allowedNamespacesLoaded);

  return {
    clusterWide,
    namespaces: narrow ? allowedNamespaces : namespaces,
    perNamespace,
    resolved: !enabled || clusterWide || perNamespace,
  };
};

export default useResourceWatchStrategy;
