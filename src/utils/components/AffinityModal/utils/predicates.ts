import { isEqualObject } from '@kubevirt-utils/components/NodeSelectorModal/utils/helpers';

import { type AffinityLabel } from './types';

export const has = (object: object | Record<string, unknown>, key: string): boolean => {
  const keyParts = key.split('.');
  const record = object as Record<string, unknown>;

  return (
    !!object &&
    (keyParts.length > 1
      ? has(record[keyParts[0]] as Record<string, unknown>, keyParts.slice(1).join('.'))
      : Object.prototype.hasOwnProperty.call(object, key))
  );
};

export const get = (
  obj: object | Record<string, unknown>,
  path: string,
  defaultValue: unknown = undefined,
): unknown => {
  const travel = (regexp: RegExp): unknown =>
    path
      .split(regexp)
      .filter(Boolean)
      .reduce<unknown>(
        (res, key) =>
          res !== null && res !== undefined ? (res as Record<string, unknown>)[key] : res,
        obj,
      );
  const result = travel(/[,[\]]+/) || travel(/[,[\].]+/);
  return result === undefined || result === obj ? defaultValue : result;
};

export const withOperatorPredicate = <T extends AffinityLabel = AffinityLabel>(
  store: object | Record<string, unknown>,
  label: T,
): boolean => {
  const { key, operator, values } = label;

  switch (operator) {
    case 'Exists':
      return has(store, key);
    case 'DoesNotExist':
      return !has(store, key);
    case 'In':
      return !!values?.includes(get(store, key) as string);
    case 'NotIn':
      return !values?.includes(get(store, key) as string);
    default:
      return values ? !!values.includes(get(store, key) as string) : get(store, key) === '';
  }
};

// Creates a union array from 2 arrays of objects
export const unionWith = <T>(objects: T[], others: T[]): T[] => {
  return objects.concat(
    others.filter((other) => objects.every((object) => !isEqualObject(object, other))),
  );
};

// Creates an intersection array from 2 arrays of objects
export const intersectionWith = <T>(objects: T[], others: T[]): T[] => {
  return objects.filter((object) => others.some((other) => isEqualObject(object, other)));
};
