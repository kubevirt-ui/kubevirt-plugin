import { SYSTEM_LABEL_PREFIXES } from './constants';

export const isSystemLabel = (key: string): boolean =>
  SYSTEM_LABEL_PREFIXES.some((prefix) => key.startsWith(prefix));
