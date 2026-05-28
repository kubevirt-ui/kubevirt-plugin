export const CANCEL_ALLOCATION_MESSAGE = 'not found';

export class UploadCanceledError extends Error {
  constructor() {
    super('Upload canceled');
    this.name = 'UploadCanceledError';
  }
}

export const isUploadCanceledError = (error: unknown): error is UploadCanceledError =>
  error instanceof UploadCanceledError;
