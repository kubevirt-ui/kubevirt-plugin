// @ai-rules:
// 1. [Pattern]: Single source of truth for "watch cluster-wide vs per-namespace" decisions (CNV-101272).
// 2. [Gotcha]: `resolved` is false until the strategy is known — callers must not report loaded before.
// 3. [Gotcha]: Namespace narrowing only runs for mixed RBAC (CAN_LIST_NS true, resource list denied),
//    so namespace-only users keep the pre-existing behavior with no extra access reviews.
import { useCanListNamespaces } from '@kubevirt-utils/hooks/useCanListNamespaces';
import { type K8sGroupVersionKind, useK8sModel } from '@openshift-console/dynamic-plugin-sdk';

import useCanListResourceClusterWide from './useCanListResourceClusterWide';
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
  const canListAllNamespaces = useCanListNamespaces();
  const [model, modelInFlight] = useK8sModel(groupVersionKind);
  const attributes =
    enabled && model ? { group: groupVersionKind.group ?? '', resource: model.plural } : null;

  const [canListClusterWide, accessLoading] = useCanListResourceClusterWide(attributes, {
    cluster,
    namespace,
  });
  const accessResolved = !enabled || (!modelInFlight && !accessLoading);

  const narrow =
    enabled && accessResolved && narrowNamespaces && canListAllNamespaces && !canListClusterWide;
  const [allowedNamespaces, allowedNamespacesLoaded] = useNamespacesWithListAccess(
    attributes ?? { group: '', resource: '' },
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
