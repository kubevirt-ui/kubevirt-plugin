import { animals, colors, NumberDictionary, uniqueNamesGenerator } from 'unique-names-generator';

import { MAX_K8S_NAME_LENGTH } from '@kubevirt-utils/utils/constants';

export const getRandomChars = (len = 6): string => {
  // eslint-disable-next-line -- sonarjs/pseudo-random
  return Math.random()
    .toString(36)
    .replace(/[^a-z0-9]+/g, '')
    .slice(1, len + 1);
};

export const addRandomSuffix = (str: string): string => str.concat(`-${getRandomChars()}`);

export const truncateToK8sName = (
  name: string,
  suffix: string = getRandomChars(),
  maxLength = MAX_K8S_NAME_LENGTH,
): string => {
  const separator = suffix ? '-' : '';
  const fullName = `${name}${separator}${suffix}`;
  if (fullName.length <= maxLength) return fullName;

  const availableLength = maxLength - suffix.length - separator.length;
  const truncatedName = name.slice(0, Math.max(1, availableLength)).replace(/-$/, '');
  return `${truncatedName}${separator}${suffix}`;
};

export const generatePrettyName = (prefix?: string): string => {
  const numberDictionary = NumberDictionary.generate({ length: 2 });
  const prefixValue = prefix ? `${prefix}-` : '';

  return `${prefixValue}${uniqueNamesGenerator({
    dictionaries: [colors, animals, numberDictionary],
    separator: '-',
  })}`;
};

export const generateUploadDiskName = (diskName: string, prefix: string): string => {
  return `${diskName}-${generatePrettyName(prefix)}`;
};

const DOCKER_PREFIX = 'docker://';

export const appendDockerPrefix = (image: string): string => {
  return image?.startsWith(DOCKER_PREFIX) ? image : DOCKER_PREFIX.concat(image);
};

export const removeDockerPrefix = (image: string): string => image?.replace(DOCKER_PREFIX, '');

export const removeAllWhitespace = (str: string): string => {
  return str.trim().replace(/\s+/g, '');
};

export const removeDuplicatesByName = <T>(array: T[], nameProperty = 'name'): T[] =>
  array?.reduce<T[]>((acc, curr) => {
    if (!acc.some((item) => item?.[nameProperty] === curr?.[nameProperty])) acc.push(curr);
    return acc;
  }, []);
