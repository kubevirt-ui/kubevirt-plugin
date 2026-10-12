/**
 * Logger re-export for compatibility with kubevirt-ui import paths.
 * The canonical logger lives in file-utils.ts; this module lets ported code
 * import `{ logger }` from `@/utils/logger` unchanged.
 */
export { logger } from './file-utils';
