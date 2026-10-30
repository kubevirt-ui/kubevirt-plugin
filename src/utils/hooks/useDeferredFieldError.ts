import { useCallback, useEffect, useState } from 'react';

import { useDebounceCallback } from '@kubevirt-utils/hooks/useDebounceCallback';
import { ValidatedOptions } from '@patternfly/react-core';

const DEFAULT_DEBOUNCE_MS = 1000;

type UseDeferredFieldErrorResult = {
  errorText: string | undefined;
  onValueChange: () => void;
  revealError: () => void;
  validated: ValidatedOptions;
};

export const useDeferredFieldError = (
  errorMessage: string | undefined,
  debounceMs = DEFAULT_DEBOUNCE_MS,
): UseDeferredFieldErrorResult => {
  const [isVisible, setIsVisible] = useState(false);

  const revealError = useCallback((): void => {
    setIsVisible(true);
  }, []);

  const scheduleReveal = useDebounceCallback(revealError, debounceMs);

  const onValueChange = useCallback((): void => {
    setIsVisible(false);
    scheduleReveal();
  }, [scheduleReveal]);

  useEffect(() => {
    if (!errorMessage) {
      setIsVisible(false);
    }
  }, [errorMessage]);

  const errorText = isVisible ? errorMessage : undefined;
  const validated = errorText ? ValidatedOptions.error : ValidatedOptions.default;

  return { errorText, onValueChange, revealError, validated };
};
