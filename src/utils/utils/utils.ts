import { animals, colors, NumberDictionary, uniqueNamesGenerator } from 'unique-names-generator';

import { IoK8sApiCoreV1Service } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { ALL_NAMESPACES, ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import { FilterValue, K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

import { ItemsToFilterProps } from './types';

export const kubevirtConsole = console;

export const getValidNamespace = (activeNamespace: string) =>
  activeNamespace === ALL_NAMESPACES_SESSION_KEY ? DEFAULT_NAMESPACE : activeNamespace;

export const isEmpty = (obj) =>
  [Array, Object].includes((obj || {}).constructor) && !Object.entries(obj || {}).length;

export const get = (obj: unknown, path: string | string[], defaultValue = undefined) => {
  const travel = (regexp: RegExp) =>
    String.prototype.split
      .call(path, regexp)
      .filter(Boolean)
      .reduce((res: { [x: string]: any }, key: number | string) => {
        return res !== null && res !== undefined ? res[key] : res;
      }, obj);
  const result = travel(/[,[\]]+?/) || travel(/[,[\].]+?/);
  return result === undefined || result === obj ? defaultValue : result;
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

const getValueByPath = (obj: K8sResourceCommon, path: string) => {
  const pathArray = path?.split('.');
  return pathArray?.reduce((acc, field) => acc?.[field], obj);
};

export const columnSorting = <T>(
  data: T[],
  direction: string,
  pagination: { [key: string]: any },
  path: string,
) => {
  const { endIndex, startIndex } = pagination;
  const predicate = (a: T, b: T) => {
    const { first, second } =
      direction === 'asc' ? { first: a, second: b } : { first: b, second: a };
    return getValueByPath(first, path)
      ?.toString()
      ?.localeCompare(getValueByPath(second, path)?.toString(), undefined, {
        numeric: true,
        sensitivity: 'base',
      });
  };
  return data?.sort(predicate)?.slice(startIndex, endIndex);
};

export const removeDuplicatesByName = (array: any[], nameProperty = 'name') =>
  array?.reduce((acc, curr) => {
    if (!acc.find((item) => item?.[nameProperty] === curr?.[nameProperty])) acc.push(curr);
    return acc;
  }, []);

export const generatePrettyName = (prefix?: string): string => {
  const numberDictionary = NumberDictionary.generate({ length: 2 });
  const prefixValue = prefix ? `${prefix}-` : '';

  return `${prefixValue}${uniqueNamesGenerator({
    dictionaries: [colors, animals, numberDictionary],
    separator: '-',
  })}`;
};

const DOCKER_PREFIX = 'docker://';

export const appendDockerPrefix = (image: string) => {
  return image?.startsWith(DOCKER_PREFIX) ? image : DOCKER_PREFIX.concat(image);
};
export const removeDockerPrefix = (image: string) => image?.replace(DOCKER_PREFIX, '');
export const isAllNamespaces = (namespace: string) =>
  !namespace || namespace === ALL_NAMESPACES || namespace === ALL_NAMESPACES_SESSION_KEY;
