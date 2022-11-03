import {
  ALL_NAMESPACES,
  ALL_NAMESPACES_SESSION_KEY as ALL_NAMESPACES_ACTIVE_KEY,
} from './constants';

type UseActiveNamespacePathType = () => string;

export const useLastNamespacePath: UseActiveNamespacePathType = () => {
  const lastNamespace = JSON.parse(localStorage.getItem('console-user-settings'))?.[
    'console.lastNamespace'
  ];

  return lastNamespace === ALL_NAMESPACES_ACTIVE_KEY ? ALL_NAMESPACES : `ns/${lastNamespace}`;
};
