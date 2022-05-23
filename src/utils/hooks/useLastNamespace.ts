import * as React from 'react';

import {
  ALL_NAMESPACES,
  ALL_NAMESPACES_SESSION_KEY,
  LAST_NAMESPACE_SESSION_STORAGE,
} from './constants';

type UseLastNamespaceType = () => [
  lastNamespace: string | undefined,
  changeLastNamespace: (namespace: string) => void,
];

export const useLastNamespace: UseLastNamespaceType = () => {
  const sessionNamespace = sessionStorage.getItem(LAST_NAMESPACE_SESSION_STORAGE);

  const [lastNamespace, setLastNamespace] = React.useState<string>(
    !sessionNamespace || sessionNamespace === ALL_NAMESPACES_SESSION_KEY
      ? ALL_NAMESPACES
      : sessionNamespace,
  );

  React.useEffect(() => {
    sessionStorage.setItem(
      LAST_NAMESPACE_SESSION_STORAGE,
      lastNamespace === ALL_NAMESPACES ? ALL_NAMESPACES_SESSION_KEY : lastNamespace,
    );
  }, [lastNamespace]);

  return [lastNamespace, setLastNamespace];
};
