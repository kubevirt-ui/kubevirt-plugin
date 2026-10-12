import type { PathValidationConfig } from './types';

const normalizePath = (filePath: string): string => filePath.replace(/^\//, '');

/** Return true when a changed file path is sensitive per the given config. */
export const isSensitivePath = (filePath: string, config: PathValidationConfig): boolean => {
  const normalized = normalizePath(filePath);

  if (config.exactPaths.includes(normalized)) {
    return true;
  }

  if (config.relatedAutomationPaths?.includes(normalized)) {
    return true;
  }

  if (config.relatedAutomationPrefixes?.some((prefix) => normalized.startsWith(prefix))) {
    return true;
  }

  return config.pathPrefixes.some((prefix) => normalized.startsWith(prefix));
};

/** Filter a list of changed file paths to only sensitive paths per the given config. */
export const getSensitivePaths = (filePaths: string[], config: PathValidationConfig): string[] =>
  filePaths.filter((filePath) => isSensitivePath(filePath, config));
