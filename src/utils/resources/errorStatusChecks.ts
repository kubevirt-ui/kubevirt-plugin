const HTTP_NOT_FOUND = 404;

type K8sError = {
  code?: number;
  json?: { code?: number };
  response?: { status?: number };
};

export const isK8sNotFoundError = (error: unknown): boolean => {
  const err = error as K8sError | null | undefined;
  return (
    err?.code === HTTP_NOT_FOUND ||
    err?.response?.status === HTTP_NOT_FOUND ||
    err?.json?.code === HTTP_NOT_FOUND
  );
};
