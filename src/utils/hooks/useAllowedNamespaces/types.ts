import type { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

export type AllowedNamespacesResponse = {
  allowedNamespaces: string[];
};

export type AllowedNamespacesFetchEntry = {
  data: AllowedNamespacesResponse | undefined;
  error: Error | null;
};

export type UseFetchAllowedNamespacesResult = {
  data: AllowedNamespacesResponse | undefined;
  error: Error | null;
  loaded: boolean;
};

export type UseAllowedNamespacesResult = {
  namespaces: K8sResourceCommon[] | undefined;
  namespacesError: Error | null;
  namespacesLoaded: boolean;
};
