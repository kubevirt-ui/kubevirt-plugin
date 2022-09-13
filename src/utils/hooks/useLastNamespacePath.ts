import { useLastNamespace } from '@openshift-console/dynamic-plugin-sdk-internal';

import {
  ALL_NAMESPACES,
  ALL_NAMESPACES_SESSION_KEY as ALL_NAMESPACES_ACTIVE_KEY,
} from './constants';

type UseActiveNamespacePathType = () => [
  lastNamespace: string | undefined,
  changeLastNamespace: (namespace: string) => void,
];

export const useLastNamespacePath: UseActiveNamespacePathType = () => {
  const [lastNamespace, setLastNamespace] = useLastNamespace();

  return [
    lastNamespace === ALL_NAMESPACES_ACTIVE_KEY ? ALL_NAMESPACES : `ns/${lastNamespace}`,
    setLastNamespace,
  ];
};
