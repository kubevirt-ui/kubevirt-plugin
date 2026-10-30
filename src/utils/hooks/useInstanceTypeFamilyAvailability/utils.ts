import { type InstanceTypeSeriesName } from '@kubevirt-utils/resources/instancetype/types';

import { INSTANCE_TYPE_SERIES } from './constants';

export const isInstanceTypeSeries = (value: string): value is InstanceTypeSeriesName =>
  INSTANCE_TYPE_SERIES.includes(value as InstanceTypeSeriesName);

export const parseDisabledInstanceTypeFamilies = (raw?: string): InstanceTypeSeriesName[] => {
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter(
      (item): item is InstanceTypeSeriesName =>
        typeof item === 'string' && isInstanceTypeSeries(item),
    );
  } catch {
    return [];
  }
};

export const serializeDisabledInstanceTypeFamilies = (families: InstanceTypeSeriesName[]): string =>
  JSON.stringify([...new Set(families)].sort((a, b) => a.localeCompare(b)));

export const addDisabledInstanceTypeFamily = (
  families: InstanceTypeSeriesName[],
  series: InstanceTypeSeriesName,
): InstanceTypeSeriesName[] => (families.includes(series) ? families : [...families, series]);

export const removeDisabledInstanceTypeFamily = (
  families: InstanceTypeSeriesName[],
  series: InstanceTypeSeriesName,
): InstanceTypeSeriesName[] => families.filter((family) => family !== series);

export const isInstanceTypeFamilyVisible = (
  series: string,
  disabledFamilies: ReadonlySet<string>,
  preserveFamily?: string,
): boolean => {
  if (preserveFamily && series === preserveFamily) {
    return true;
  }
  return !disabledFamilies.has(series);
};
