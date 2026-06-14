import { KubevirtFilter } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { EXCLUSION_PREFIX } from '@search/searchLanguage/constants';

/**
 * Validates values in a key:val1,val2 token against known options.
 * Returns the token with only valid (matching) values, or null if none match.
 */
export const buildValidatedToken = (
  trimmedInput: string,
  filterType: string,
  filterDefinitions: KubevirtFilter[],
): null | string => {
  const prefix = trimmedInput.startsWith(EXCLUSION_PREFIX) ? EXCLUSION_PREFIX : '';
  const withoutPrefix = prefix ? trimmedInput.slice(1) : trimmedInput;

  const colonIndex = withoutPrefix.indexOf(':');
  if (colonIndex <= 0) return trimmedInput;

  const key = withoutPrefix.slice(0, colonIndex);
  const valuesPart = withoutPrefix.slice(colonIndex + 1);

  if (!valuesPart) return null;

  const filterDef = filterDefinitions.find((d) => d.id === filterType);
  if (isEmpty(filterDef?.options)) return trimmedInput;

  const optionSet = new Map<string, string>();
  for (const opt of filterDef.options) {
    optionSet.set(opt.value.toLowerCase(), opt.value);
  }

  const segments = valuesPart.split(',').filter(Boolean);
  const validValues = segments.map((seg) => optionSet.get(seg.toLowerCase())).filter(Boolean);

  if (isEmpty(validValues)) return null;

  return `${prefix}${key}:${validValues.join(',')}`;
};
