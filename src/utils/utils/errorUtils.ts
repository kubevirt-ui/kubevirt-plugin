const ALREADY_CREATED_ERROR_CODE = 409;

export const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

export const createIfNotExists = async (request: Promise<unknown>): Promise<void> => {
  try {
    await request;
  } catch (error) {
    if ((error as { code?: number })?.code !== ALREADY_CREATED_ERROR_CODE) throw error;
  }
};
