/** Marks a validation failure already reported via label/status -- distinguishes it from a truly unexpected exception in a top-level catch handler. */
export class HandledValidationError extends Error {
  readonly handled = true as const;

  constructor(message: string) {
    super(message);
    this.name = 'HandledValidationError';
  }
}
