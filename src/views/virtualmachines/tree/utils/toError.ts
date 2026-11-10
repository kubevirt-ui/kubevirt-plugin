import { isK8sApiError } from '@kubevirt-utils/errors/errorTypes';

export const toError = (value: unknown): Error | undefined => {
  if (!value) {
    return undefined;
  }

  if (value instanceof Error || isK8sApiError(value)) {
    return value;
  }

  return new Error(String(value));
};
