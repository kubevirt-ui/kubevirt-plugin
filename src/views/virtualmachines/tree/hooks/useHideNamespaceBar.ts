import { useEffect } from 'react';

export const useHideNamespaceBar = () => {
  useEffect(() => {
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
  }, []);
};
