import {
  getSensitivePaths as getSensitivePathsForConfig,
  isSensitivePath,
} from '../pr-path-validation/paths';
import { I18N_CONFIG } from './constants';

/** Return true when a changed file path is a translation catalog. */
export const isSensitiveI18nPath = (filePath: string): boolean =>
  isSensitivePath(filePath, I18N_CONFIG);

/** Filter a list of changed file paths to only translation catalog paths. */
export const getSensitivePaths = (filePaths: string[]): string[] =>
  getSensitivePathsForConfig(filePaths, I18N_CONFIG);
