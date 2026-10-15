import { type InstanceTypeSeries } from '@kubevirt-utils/resources/instancetype/types';

import { INSTANCE_TYPE_SERIES } from './constants';

export const isInstanceTypeSeries = (value: string): value is InstanceTypeSeries =>
  INSTANCE_TYPE_SERIES.includes(value as InstanceTypeSeries);

export const parseDisabledInstanceTypeFamilies = (raw?: string): InstanceTypeSeries[] => {
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter(
      (item): item is InstanceTypeSeries => typeof item === 'string' && isInstanceTypeSeries(item),
    );
  } catch {
    return [];
  }
};

export const serializeDisabledInstanceTypeFamilies = (families: InstanceTypeSeries[]): string =>
  JSON.stringify([...new Set(families)].sort((a, b) => a.localeCompare(b)));

export const addDisabledInstanceTypeFamily = (
  families: InstanceTypeSeries[],
  series: InstanceTypeSeries,
): InstanceTypeSeries[] => (families.includes(series) ? families : [...families, series]);

export const removeDisabledInstanceTypeFamily = (
  families: InstanceTypeSeries[],
  series: InstanceTypeSeries,
): InstanceTypeSeries[] => families.filter((family) => family !== series);

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
