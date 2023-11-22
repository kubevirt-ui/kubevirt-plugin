import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';
import { useLastNamespace } from '@openshift-console/dynamic-plugin-sdk-internal';

import {
  ALL_NAMESPACES,
  ALL_NAMESPACES_SESSION_KEY as ALL_NAMESPACES_ACTIVE_KEY,
} from './constants';

type UseActiveNamespacePathType = () => string;

export const buildNSPath = (namespace: string): string =>
  [ALL_NAMESPACES, ALL_NAMESPACES_ACTIVE_KEY].includes(namespace)
    ? ALL_NAMESPACES
    : `ns/${namespace}`;

export const useLastNamespacePath: UseActiveNamespacePathType = () => {
  const [lastNamespace] = useLastNamespace();
  const [activeNamespace] = useActiveNamespace();

  return !lastNamespace ? buildNSPath(activeNamespace) : buildNSPath(lastNamespace);
};
