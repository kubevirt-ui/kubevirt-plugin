// @ai-rules:
// 1. [Pattern]: One-shot SSAR fan-out (checkAccess is memoized per session by the console SDK).
// 2. [Gotcha]: Fail open — a namespace whose SSAR request errors is kept; the watch 403 is then soft.
// 3. [Gotcha]: `namespaces` is compared by value (joined key) to avoid re-running on new arrays.
import { useEffect, useMemo, useState } from 'react';

import { checkAccess, type K8sVerb } from '@openshift-console/dynamic-plugin-sdk';

type ListAccessAttributes = {
  group: string;
  resource: string;
};

/**
 * Filters `namespaces` down to the ones where the user may `list` the given resource.
 * Used when the project list is wider than the user's resource access (e.g. a cluster-wide
 * `acm-vm-extended:view` binding exposes every project but grants no kubevirt.io access).
 *
 * @returns [allowedNamespaces, loaded]
 */
const useNamespacesWithListAccess = (
  { group, resource }: ListAccessAttributes,
  namespaces: string[],
  enabled: boolean,
): [string[], boolean] => {
  const namespacesKey = (namespaces ?? []).join(',');
  const stableNamespaces = useMemo(
    () => (namespacesKey ? namespacesKey.split(',') : []),
    [namespacesKey],
  );

  const [state, setState] = useState<{ allowed: string[]; key: null | string }>({
    allowed: [],
    key: null,
  });

  const requestKey = enabled && resource ? `${group}|${resource}|${namespacesKey}` : null;

  useEffect(() => {
    if (!requestKey) return;

    let cancelled = false;

    void Promise.allSettled(
      stableNamespaces.map((namespace) =>
        checkAccess({ group, namespace, resource, verb: 'list' as K8sVerb }),
      ),
    ).then((results) => {
      if (cancelled) return;

      const allowed = stableNamespaces.filter((_namespace, index) => {
        const result = results[index];
        return result.status === 'rejected' || Boolean(result.value?.status?.allowed);
      });

      setState({ allowed, key: requestKey });
    });

    return (): void => {
      cancelled = true;
    };
  }, [group, resource, requestKey, stableNamespaces]);

  // Nothing to review (disabled, or the resource model is unknown): never block loading.
  if (!requestKey) return [[], true];

  return state.key === requestKey ? [state.allowed, true] : [[], false];
};

export default useNamespacesWithListAccess;
