import { IoK8sApiCoreV1Service } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { isEqualObject } from '@kubevirt-utils/components/NodeSelectorModal/utils/helpers';
import { FilterValue } from '@openshift-console/dynamic-plugin-sdk';

import { ItemsToFilterProps } from './types';

export const isEmpty = (obj) =>
  [Object, Array].includes((obj || {}).constructor) && !Object.entries(obj || {}).length;

export const get = (obj: unknown, path: string | string[], defaultValue = undefined) => {
  const travel = (regexp: RegExp) =>
    String.prototype.split
      .call(path, regexp)
      .filter(Boolean)
      .reduce((res: { [x: string]: any }, key: string | number) => {
        return res !== null && res !== undefined ? res[key] : res;
      }, obj);
  const result = travel(/[,[\]]+?/) || travel(/[,[\].]+?/);
  return result === undefined || result === obj ? defaultValue : result;
};

export const has = (object, key) => {
  const keyParts = key.split('.');

  return (
    !!object &&
    (keyParts.length > 1
      ? has(object[key.split('.')[0]], keyParts.slice(1).join('.'))
      : Object.prototype.hasOwnProperty.call(object, key))
  );
};

// this will create a union array from 2 arrays of objects
export const unionWith = (objects: any[], others: any[]) => {
  return objects.concat(
    others.filter((other) => objects.every((object) => !isEqualObject(object, other))),
  );
};

// this will create an intersection array from 2 arrays of objects
export const intersectionWith = (objects: any[], others: any[]) => {
  return objects.filter((object) => others.some((other) => isEqualObject(object, other)));
};

export const size = (obj: { [key: string]: any }) => Object.keys(obj).length;

export const sumBy = (arr, func) => arr?.reduce((acc, item) => acc + func(item), 0);

export const upperFirst = (str) => `${str.charAt(0).toUpperCase()}${str.slice(1)}`;

export const take = (arr, qty = 1) => [...arr].splice(0, qty);

export const pullAt = (arr, indices) =>
  indices
    .reverse()
    .map((idx) => arr.splice(idx, 1)[0])
    .reverse();

export const remove = (array, iteratee) => {
  // in order to not mutate the original array until the very end
  // we want to cache the indexes to remove while preparing the result to return
  const toRemove = [];
  const result = array.filter((item, i) => iteratee(item) && toRemove.push(i));

  // just before returning, we can then remove the items, making sure we start
  // from the higher indexes: otherwise they would shift at each removal
  toRemove.reverse().forEach((i) => array.splice(i, 1));
  return result;
};

export const isUpstream = (window as any).SERVER_FLAGS?.branding === 'okd';

export const isString = (val: unknown) => val !== null && typeof val === 'string';

export const getSSHNodePort = (sshService: IoK8sApiCoreV1Service) =>
  sshService?.spec?.ports?.find((port) => parseInt(port.targetPort, 10) === 22)?.nodePort;

export const isTemplateParameter = (value: string): boolean =>
  Boolean(/^\${[A-z0-9_]+}$/.test(value));

export const getRandomChars = (len = 6): string => {
  return Math.random()
    .toString(36)
    .replace(/[^a-z0-9]+/g, '')
    .substr(1, len);
};

export const SSH_PUBLIC_KEY_VALIDATION_REGEX =
  /^(sk-)?(ssh-rsa AAAAB3NzaC1yc2|ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNT|ecdsa-sha2-nistp384 AAAAE2VjZHNhLXNoYTItbmlzdHAzODQAAAAIbmlzdHAzOD|ecdsa-sha2-nistp521 AAAAE2VjZHNhLXNoYTItbmlzdHA1MjEAAAAIbmlzdHA1Mj|ssh-ed25519 AAAAC3NzaC1lZDI1NTE5|ssh-dss AAAAB3NzaC1kc3)[0-9A-Za-z+/]+[=]{0,3}( .*)?$/;

export const validateSSHPublicKey = (value: string): boolean => {
  const trimmedValue = value?.trim();
  return isEmpty(trimmedValue) || Boolean(SSH_PUBLIC_KEY_VALIDATION_REGEX?.test(trimmedValue));
};

export const getContentScrollableElement = (): HTMLElement =>
  document.getElementById('content-scrollable');

export const findAllIndexes = <T>(
  array: T[],
  predicate: (element: T, index: number, array: T[]) => boolean,
): number[] =>
  Array.from(array.entries()).reduce<number[]>(
    (acc, [index, element]) => (predicate(element, index, array) ? [...acc, index] : acc),
    [],
  );

// return the name or 'Other' if the name not included in the array of available items for filtering
export const getItemNameWithOther = (itemName: string, items: ItemsToFilterProps[]): string => {
  return !items?.find((item: ItemsToFilterProps) => item.id === itemName) || itemName === 'Other'
    ? 'Other'
    : itemName;
};

export const includeFilter = (
  compareData: FilterValue,
  items: ItemsToFilterProps[],
  itemName: string,
): boolean => {
  const compareString = getItemNameWithOther(itemName, items);

  return compareData.selected?.length === 0 || compareData.selected?.includes(compareString);
};

export const ensurePath = <T extends object>(data: T, paths: string | string[]) => {
  let current = data;

  if (Array.isArray(paths)) {
    paths.forEach((path) => ensurePath(data, path));
  } else {
    const keys = paths.split('.');

    for (const key of keys) {
      if (!current[key]) current[key] = {};
      current = current[key];
    }
  }
};
