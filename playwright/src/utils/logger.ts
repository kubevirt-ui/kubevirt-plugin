/** Logging for global setup/teardown rules (kubevirt-ui main style). */
export const logger = {
  error: (message: string): void => console.error(message),
  info: (message: string): void => console.log(message),
  success: (message: string): void => console.log(`✓ ${message}`),
  warn: (message: string): void => console.warn(message),
};
