import { useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

type HandlePromise = <T>(
  promise: Promise<T>,
  onFulfill?: (res) => void,
  onError?: (errorMsg: string) => void,
) => void;
type UsePromise = (componentName: string) => [HandlePromise, boolean, string];

const usePromise: UsePromise = (componentName) => {
  const [inProgress, setInProgress] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const { t } = useKubevirtTranslation();

  const handlePromise = (promise, onFulfill, onError) => {
    setInProgress(true);
    promise.then(
      (res) => {
        setInProgress(false);
        setErrorMessage('');
        onFulfill && onFulfill(res);
      },
      (error) => {
        const errorMsg = error.message || t('An error occurred. Please try again.');
        setInProgress(false);
        setErrorMessage(errorMsg);
        onError
          ? onError(errorMsg)
          : // eslint-disable-next-line no-console
            console.error(`handlePromise failed in component ${componentName}:`, error);
      },
    );
  };

  return [handlePromise, inProgress, errorMessage];
};

export default usePromise;
