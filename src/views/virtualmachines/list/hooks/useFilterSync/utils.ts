import { isEmpty } from '@kubevirt-utils/utils/utils';

export const hasMismatch = (targetValue: string | undefined, filterValues: string[]): boolean =>
  !!targetValue &&
  (isEmpty(filterValues) || filterValues.length > 1 || !filterValues.includes(targetValue));
