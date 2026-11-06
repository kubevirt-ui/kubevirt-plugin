import { isForbiddenError, isK8sApiError } from '@kubevirt-utils/errors/errorTypes';

export const isHardInventoryError = (error: unknown): boolean => {
  if (isForbiddenError(error)) {
    return true;
  }

  if (!isK8sApiError(error)) {
    return false;
  }

  const status = error.response?.status ?? error.code;

  return status === 401 || status === 404;
};
