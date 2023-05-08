import startCase from 'lodash.startcase';
import { plural } from 'pluralize';

export const pluralizeKind = (kind: string): string => {
  // Use startCase to separate words so the last can be pluralized but remove spaces so as not to humanize
  const pluralized = plural(startCase(kind)).replace(/\s+/g, '');
  // Handle special cases like DB -> DBs (instead of DBS).
  if (pluralized === `${kind}S`) {
    return `${kind}s`;
  }
  return pluralized;
};
