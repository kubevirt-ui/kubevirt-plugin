import { useEffect } from 'react';

const useWizardBeforeUnload = (enabled: boolean): void => {
  useEffect(() => {
    if (!enabled) return;

    const handler = (event: BeforeUnloadEvent): void => {
      event.preventDefault();
    };

    window.addEventListener('beforeunload', handler);
    return (): void => window.removeEventListener('beforeunload', handler);
  }, [enabled]);
};

export default useWizardBeforeUnload;
