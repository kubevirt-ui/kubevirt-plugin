import { type TFunction } from 'i18next';

import { type IDLabel } from './types';

export const nodeSelectorToIDLabels = (nodeSelector: { [key: string]: string }): IDLabel[] =>
  Object.entries(nodeSelector || {}).map(([key, value], id) => ({ id, key, value }));

export const idLabelsToNodeSelector = (labels: IDLabel[]): Record<string, string> =>
  labels.reduce<Record<string, string>>((acc, { key, value }) => {
    if (key.trim()) {
      acc[key] = value ?? '';
    }
    return acc;
  }, {});

export const hasIncompleteSelectorLabels = (labels: IDLabel[]): boolean =>
  labels.some(({ key }) => !key.trim());

export const getIncompleteSelectorLabelMessage = (key: string, t: TFunction): string | undefined =>
  key.trim() ? undefined : t('Key is required');

export const getIncompleteSelectorLabelsTooltip = (
  isIncomplete: boolean,
  t: TFunction,
): string | undefined => (isIncomplete ? t('Key must not be empty') : undefined);

export const isEqualObject = (object: unknown, otherObject: unknown): boolean => {
  if (object === otherObject) {
    return true;
  }

  if (object === null || otherObject === null) {
    return false;
  }

  if (typeof object !== 'object' || typeof otherObject !== 'object') {
    return false;
  }

  if (object.constructor !== otherObject.constructor) {
    return false;
  }

  const objectRecord = object as Record<string, unknown>;
  const otherObjectRecord = otherObject as Record<string, unknown>;

  const objectKeys = Object.keys(objectRecord);
  const otherObjectKeys = Object.keys(otherObjectRecord);

  if (objectKeys.length !== otherObjectKeys.length) {
    return false;
  }

  for (const key of objectKeys) {
    if (
      !otherObjectKeys.includes(key) ||
      !isEqualObject(objectRecord[key], otherObjectRecord[key])
    ) {
      return false;
    }
  }

  return true;
};
