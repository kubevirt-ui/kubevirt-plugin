export class HandledValidationError extends Error {
  readonly handled = true as const;

  constructor(message: string) {
    super(message);
    this.name = 'HandledValidationError';
  }
}
