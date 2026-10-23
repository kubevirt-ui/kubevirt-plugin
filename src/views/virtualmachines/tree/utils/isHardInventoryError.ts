import { isForbiddenError, isK8sApiError } from '@kubevirt-utils/errors/errorTypes';

export const isHardInventoryError = (error: unknown): boolean => {
  if (isForbiddenError(error)) {
    return true;
  }

  if (!isK8sApiError(error)) {
    return false;
  }

  return (
    error.response?.status === 401 ||
    error.code === 401 ||
    error.response?.status === 404 ||
    error.code === 404
  );
};
