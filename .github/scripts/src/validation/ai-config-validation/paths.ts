import {
  getSensitivePaths as getSensitivePathsForConfig,
  isSensitivePath,
} from '../pr-path-validation/paths';
import { AI_CONFIG } from './constants';

/** Return true when a changed file path is sensitive AI/editor configuration or PR automation. */
export const isSensitiveAiConfigPath = (filePath: string): boolean =>
  isSensitivePath(filePath, AI_CONFIG);

/** Filter a list of changed file paths to only sensitive paths. */
export const getSensitivePaths = (filePaths: string[]): string[] =>
  getSensitivePathsForConfig(filePaths, AI_CONFIG);
