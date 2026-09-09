import { type IDLabel } from './types';

export const nodeSelectorToIDLabels = (nodeSelector: { [key: string]: string }): IDLabel[] =>
  Object.entries(nodeSelector || {}).map(([key, value], id) => ({ id, key, value }));

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
