// @ai-rules:
// 1. [Pattern]: Answers "can the user `list` this exact resource across all namespaces?" via SSAR.
//    Never substitute CAN_LIST_NS (list core namespaces) for this check (CNV-101272).
// 2. [Gotcha]: Pass `null` (or an empty resource) to skip; skipped reviews report [false, false].
// 3. [Gotcha]: The console SSAR helpers fail open (allowed=true) when the SSAR request itself errors.
import { type K8sVerb } from '@openshift-console/dynamic-plugin-sdk';
import { useFleetAccessReview } from '@stolostron/multicluster-sdk';

export type ListAccessAttributes = {
  group: string;
  resource: string;
};

type Scope = {
  cluster?: string;
  namespace?: string;
};

/**
 * True when the user may `list` the resource in all namespaces (or in `namespace` when set).
 * Unlike CAN_LIST_NS (core `namespaces` list), this reflects permission on the resource itself, so
 * mixed RBAC such as a cluster-wide `acm-vm-extended:view` binding (namespaces/projects only) plus
 * a namespace-scoped kubevirt.io RoleBinding is reported as `false`.
 *
 * @returns [canList, loading]
 */
const useCanListResourceClusterWide = (
  attributes: ListAccessAttributes | null,
  { cluster, namespace }: Scope = {},
): [boolean, boolean] => {
  const skip = !attributes?.resource;

  const [canList, loading] = useFleetAccessReview({
    cluster,
    group: skip ? '' : attributes.group,
    namespace,
    resource: skip ? '' : attributes.resource,
    verb: 'list' as K8sVerb,
  });

  return skip ? [false, false] : [canList, loading];
};

export default useCanListResourceClusterWide;
