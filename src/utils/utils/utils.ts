import { animals, colors, NumberDictionary, uniqueNamesGenerator } from 'unique-names-generator';

import { IoK8sApiCoreV1Service } from '@kubevirt-ui/kubevirt-api/kubernetes';
import {
  DEFAULT_NAMESPACE,
  KUBEVIRT_HYPERCONVERGED,
  KUBEVIRT_OS_IMAGES_NS,
  OPENSHIFT_CNV,
  OPENSHIFT_OS_IMAGES_NS,
} from '@kubevirt-utils/constants/constants';
import { ALL_NAMESPACES, ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import { FilterValue, K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { k8sBasePath } from '@openshift-console/dynamic-plugin-sdk/lib/utils/k8s/k8s';
import { SortByDirection } from '@patternfly/react-table';

import { IPAddress, ItemsToFilterProps } from './types';

export const kubevirtConsole = console;

export const clusterBasePath = k8sBasePath.slice(0, k8sBasePath.lastIndexOf('api/kubernetes'));

export const isAllNamespaces = (namespace: string) =>
  !namespace || namespace === ALL_NAMESPACES || namespace === ALL_NAMESPACES_SESSION_KEY;

export const getValidNamespace = (activeNamespace: string) =>
  activeNamespace === ALL_NAMESPACES_SESSION_KEY ? DEFAULT_NAMESPACE : activeNamespace;

export const getNamespacePathSegment = (namespace: string) =>
  isAllNamespaces(namespace) ? ALL_NAMESPACES : `ns/${namespace}`;

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

export const pick = (object, keys) => {
  return keys.reduce((obj, key) => {
    if (object && object.hasOwnProperty(key)) {
      obj[key] = object[key];
    }
    return obj;
  }, {});
};

export const isUpstream = window.SERVER_FLAGS.branding === 'okd';

export const DEFAULT_OPERATOR_NAMESPACE = isUpstream ? KUBEVIRT_HYPERCONVERGED : OPENSHIFT_CNV;

export const OS_IMAGES_NS = isUpstream ? KUBEVIRT_OS_IMAGES_NS : OPENSHIFT_OS_IMAGES_NS;

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

export const addRandomSuffix = (str: string) => str.concat(`-${getRandomChars()}`);

export const SSH_PUBLIC_KEY_VALIDATION_REGEX =
  /^(ssh-(rsa|dss|ed25519)|sk-ssh-(rsa|ed25519)@openssh\.com|ecdsa-sha2-nistp(256|384|521))\s+[A-Za-z0-9+/=]+(?:\s+.+)?$/;

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

export const comparePathsValues =
  <T>(path: string) =>
  (first: T, second: T): number =>
    universalComparator(getValueByPath(first, path), getValueByPath(second, path));

export const columnSorting = <T>(
  data: T[],
  direction: string,
  pagination: { [key: string]: any },
  path: string,
) => columnSortingCompare(data, direction, pagination, comparePathsValues(path));

export const columnSortingCompare = <T>(
  data: T[],
  direction: string,
  pagination: { [key: string]: any },
  compareFunction: (a: T, b: T) => number,
) => {
  const { endIndex, startIndex } = pagination || { endIndex: data.length, startIndex: 0 };
  const predicate = (a: T, b: T) => {
    const { first, second } =
      direction === 'asc' ? { first: a, second: b } : { first: b, second: a };
    return compareFunction(first, second);
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

/**
 * Compares all types by converting them to string.
 * Nullish entities are converted to empty string.
 * @see localeCompare
 * @param a -
 * @param b -
 * @param locale to be used by string compareFn
 */
export const universalComparator = (a: any, b: any, locale?: string): number =>
  localeCompare(String(a ?? ''), String(b ?? ''), locale);

/**
 * Uses native string localCompare method with numeric option enabled.
 * @param a -
 * @param b -
 * @param locale to be used by string compareFn
 */
export const localeCompare = (a: string, b: string, locale: string): number =>
  a.localeCompare(b, locale, { numeric: true });

export const sortByDirection = (
  comparator: (a: any, b: any, locale?: string) => number,
  direction: SortByDirection,
) => {
  const multiplier = direction === SortByDirection.desc ? -1 : 1;
  return (a: any, b: any, locale?: string) => multiplier * comparator(a, b, locale);
};

export const compareWithDirection = (direction: SortByDirection, a: any, b: any) =>
  sortByDirection(universalComparator, direction)(a, b);

export const ipv6Regex =
  /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$|^(?:[0-9a-fA-F]{1,4}:)*::(?:[0-9a-fA-F]{1,4}:)*[0-9a-fA-F]{1,4}$|^(?:[0-9a-fA-F]{1,4}:)*::[0-9a-fA-F]{1,4}$|^[0-9a-fA-F]{1,4}::(?:[0-9a-fA-F]{1,4}:)*[0-9a-fA-F]{1,4}$/;

export const isIPv6 = (ip: string): boolean => {
  if (isEmpty(ip)) return false;

  ip = ip?.trim();
  return ipv6Regex.test(ip);
};

export const removeIPV6 = (ipAddress: IPAddress[]) => {
  const ipAddressWithoutIPv6 = ipAddress.filter((item) => !isIPv6(item.ip));
  return ipAddressWithoutIPv6;
};
