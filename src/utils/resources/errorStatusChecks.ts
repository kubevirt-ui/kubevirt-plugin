const HTTP_FORBIDDEN = 403;
const HTTP_NOT_FOUND = 404;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const getK8sErrorStatus = (error: unknown): number | undefined => {
  if (!isRecord(error)) return undefined;

  if (typeof error.code === 'number') {
    return error.code;
  }

  if (isRecord(error.response) && typeof error.response.status === 'number') {
    return error.response.status;
  }

  if (isRecord(error.json) && typeof error.json.code === 'number') {
    return error.json.code;
  }

  return undefined;
};

const isK8sStatusError = (error: unknown, status: number): boolean =>
  getK8sErrorStatus(error) === status;

export const isK8sNotFoundError = (error: unknown): boolean =>
  isK8sStatusError(error, HTTP_NOT_FOUND);

export const isK8sForbiddenError = (error: unknown): boolean =>
  isK8sStatusError(error, HTTP_FORBIDDEN);
