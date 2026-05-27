import { useEffect } from 'react';

import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { ALL_NAMESPACES_KEY } from '@kubevirt-utils/hooks/constants';
import { isEmpty } from '@kubevirt-utils/utils/utils';

export type UseInitialNamespaceSelectionProps = {
  cluster: string;
  includeAllNamespaces: boolean;
  isACMPage: boolean;
  namespace: string;
  onNamespaceChange: (namespace: string) => void;
  namespaceLoaded: boolean;
  namespaces: string[];
  showNamespaceDropdown: boolean;
};

export const useInitialNamespaceSelection = ({
  cluster,
  includeAllNamespaces,
  isACMPage,
  namespace,
  onNamespaceChange,
  namespaceLoaded,
  namespaces,
  showNamespaceDropdown,
}: UseInitialNamespaceSelectionProps): void => {
  useEffect(() => {
    if (!isACMPage) return;
    if (includeAllNamespaces) return;

    if (cluster && isEmpty(namespace) && namespaceLoaded && showNamespaceDropdown) {
      const defaultNamespace = namespaces?.find((ns) => ns === DEFAULT_NAMESPACE);
      const selectedNamespace = defaultNamespace || namespaces?.[0] || ALL_NAMESPACES_KEY;
      onNamespaceChange(selectedNamespace);
    }
  }, [
    isACMPage,
    cluster,
    includeAllNamespaces,
    namespace,
    onNamespaceChange,
    namespaceLoaded,
    namespaces,
    showNamespaceDropdown,
  ]);
};
