import {
  getSensitivePaths as getSensitivePathsForConfig,
  isSensitivePath,
} from '../pr-path-validation/paths';
import { CI_SCRIPTS_CONFIG } from './constants';

/** Return true when a changed file path is sensitive CI configuration. */
export const isSensitiveCiScriptsPath = (filePath: string): boolean =>
  isSensitivePath(filePath, CI_SCRIPTS_CONFIG);

/** Filter a list of changed file paths to only sensitive CI configuration paths. */
export const getSensitivePaths = (filePaths: string[]): string[] =>
  getSensitivePathsForConfig(filePaths, CI_SCRIPTS_CONFIG);
