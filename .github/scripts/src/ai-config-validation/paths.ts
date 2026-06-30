import { AI_CONFIG } from './constants';

const normalizePath = (filePath: string): string => filePath.replace(/^\//, '');

/** Return true when a changed file path is sensitive AI/editor configuration or PR automation. */
export const isSensitiveAiConfigPath = (filePath: string): boolean => {
  const normalized = normalizePath(filePath);

  if ((AI_CONFIG.EXACT_PATHS as readonly string[]).includes(normalized)) {
    return true;
  }

  if ((AI_CONFIG.RELATED_AUTOMATION_PATHS as readonly string[]).includes(normalized)) {
    return true;
  }

  if (AI_CONFIG.RELATED_AUTOMATION_PREFIXES.some((prefix) => normalized.startsWith(prefix))) {
    return true;
  }

  return AI_CONFIG.PATH_PREFIXES.some((prefix) => normalized.startsWith(prefix));
};

/** Filter a list of changed file paths to only sensitive paths. */
export const getSensitivePaths = (filePaths: string[]): string[] =>
  filePaths.filter(isSensitiveAiConfigPath);
