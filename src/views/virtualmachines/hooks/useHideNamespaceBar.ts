import { useEffect } from 'react';

export const useHideNamespaceBar = (): void => {
  useEffect(() => {
    const namespaceBar = document.querySelector<HTMLElement>('.co-namespace-bar');
    const originalDisplay = namespaceBar ? namespaceBar.style.display : '';

    if (namespaceBar) {
      namespaceBar.style.display = 'none';
    }

    return (): void => {
      if (namespaceBar) {
        namespaceBar.style.display = originalDisplay;
      }
    };
  }, []);
};
