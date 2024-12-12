import { useEffect } from 'react';

import { TREE_VIEW } from '@kubevirt-utils/hooks/useFeatures/constants';
import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';

export const useHideNamespaceBar = () => {
  const { featureEnabled, loading } = useFeatures(TREE_VIEW);
  useEffect(() => {
    if (loading || featureEnabled) {
      const namespaceBar = document.querySelector('.co-namespace-bar') as HTMLElement;

      const originalDisplay = namespaceBar ? namespaceBar.style.display : '';

      if (namespaceBar) {
        namespaceBar.style.display = 'none';
      }
      return () => {
        if (namespaceBar) {
          namespaceBar.style.display = originalDisplay;
        }
      };
    }
  }, [featureEnabled, loading]);
};
