import { K8sResourceCommon, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

/**
 * Hook that returns true if the current user is an admin.
 */
export const useIsAdmin = (): [boolean, boolean] => {
  // TODO: replace this with useFlag(CAN_LIST_NS) when the sdk exposes it
  const [, loaded, namespacesError] = useK8sWatchResource<K8sResourceCommon[]>({
    groupVersionKind: {
      group: 'project.openshift.io',
      version: 'v1',
      kind: 'Namespace',
    },
    namespaced: false,
    isList: true,
  });

  return [!namespacesError, loaded];
};
