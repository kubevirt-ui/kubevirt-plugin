export const getErrorStatusCode = (error: unknown): number | undefined => {
  const err = error as { code?: number; response?: { status?: number } };
  return err?.response?.status ?? err?.code;
};

export const isErrorStatusCode = (error: unknown, statusCode: number): boolean =>
  getErrorStatusCode(error) === statusCode;
