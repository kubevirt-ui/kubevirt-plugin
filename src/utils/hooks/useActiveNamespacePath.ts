import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk-internal';

import {
  ALL_NAMESPACES,
  ALL_NAMESPACES_SESSION_KEY as ALL_NAMESPACES_ACTIVE_KEY,
} from './constants';

type UseActiveNamespacePathType = () => [
  lastNamespace: string | undefined,
  changeLastNamespace: (namespace: string) => void,
];

export const useActiveNamespacePath: UseActiveNamespacePathType = () => {
  const [activeNamespace, setActiveNamespace] = useActiveNamespace();

  return [
    activeNamespace === ALL_NAMESPACES_ACTIVE_KEY ? ALL_NAMESPACES : `ns/${activeNamespace}`,
    setActiveNamespace,
  ];
};
