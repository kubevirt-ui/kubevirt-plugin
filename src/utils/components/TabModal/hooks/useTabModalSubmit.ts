import { type FormEvent, useRef, useState } from 'react';

import { kubevirtConsole } from '@kubevirt-utils/utils/utils';

type UseTabModalSubmitProps<T> = {
  closeOnSubmit: boolean;
  isDisabled?: boolean;
  obj?: T;
  onClose: () => Promise<void> | void;
  onSubmit: (obj: T) => Promise<unknown>;
  onSuccess?: (result: unknown) => void;
};

type UseTabModalSubmitResult = {
  apiError: Error | undefined;
  closeModal: () => void;
  executeSubmit: () => void;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
  isSubmitting: boolean;
};

const useTabModalSubmit = <T>({
  closeOnSubmit,
  isDisabled,
  obj,
  onClose,
  onSubmit,
  onSuccess,
}: UseTabModalSubmitProps<T>): UseTabModalSubmitResult => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<Error>(undefined);
  const isSubmittingRef = useRef(false);

  const executeSubmit = (): void => {
    if (isDisabled || isSubmittingRef.current) {
      return;
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);
    setApiError(undefined);

    Promise.resolve()
      .then(() => onSubmit(obj))
      .then(async (result) => {
        onSuccess?.(result);
        if (closeOnSubmit) {
          await onClose();
        }
      })
      .catch((submitError) => {
        setApiError(submitError);
        kubevirtConsole.error(submitError);
      })
      .finally(() => {
        isSubmittingRef.current = false;
        setIsSubmitting(false);
      });
  };

  const closeModal = (): void => {
    setApiError(undefined);
    setIsSubmitting(false);

    const promise = onClose();

    if (promise) promise?.catch(setApiError);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (isDisabled) {
      return;
    }

    executeSubmit();
  };

  return { apiError, closeModal, executeSubmit, handleSubmit, isSubmitting };
};

export default useTabModalSubmit;
