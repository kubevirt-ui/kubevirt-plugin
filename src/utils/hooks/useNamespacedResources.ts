import { useMemo } from 'react';

import { getName } from '@kubevirt-utils/resources/shared';
import { K8sResourceCommon, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

type useNamespacedResourcesType = <T extends K8sResourceCommon>(
  namespace: string,
  groupVersionKind: { group: string; kind: string; version: string },
) => [T[], boolean, any];

const useNamespacedResources: useNamespacedResourcesType = <T extends K8sResourceCommon>(
  namespace,
  groupVersionKind,
) => {
  const watchResources = namespace
    ? {
        groupVersionKind,
        isList: true,
        namespace,
        namespaced: true,
      }
    : null;

  const [unsortedResources, loaded, error] = useK8sWatchResource<T[]>(watchResources);

  const resources = useMemo(
    () => (unsortedResources || [])?.sort((a, b) => getName(a).localeCompare(getName(b))),
    [unsortedResources],
  );

  return [resources, loaded, error];
};

export default useNamespacedResources;
