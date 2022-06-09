import {
  NAME_OS_TEMPLATE_ANNOTATION,
  OS_TEMPLATE_LABEL,
  VM_OS_ANNOTATION,
} from '@kubevirt-utils/resources/vm';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

/**
 * @date 3/16/2022 - 10:08:55 AM
 *
 * @typedef {LabelsOrAnnotationsMap}
 */
type LabelsOrAnnotationsMap = {
  [key: string]: string;
};

/**
 * @date 3/16/2022 - 10:08:55 AM
 * Get a key form object that start with {keyPrefix} prefix
 * @param {LabelsOrAnnotationsMap} obj - object to search
 * @param {string} keyPrefix - prefix to search
 * @returns {*}
 */
const getPrefixedKey = (obj: LabelsOrAnnotationsMap, keyPrefix: string) =>
  obj ? Object.keys(obj).find((key) => key.startsWith(keyPrefix)) : null;

/**
 * @date 3/16/2022 - 10:08:55 AM
 * Get a value after '/' from a {key}
 * @param {string} key - key to search
 * @returns {*}
 */
const getSuffixValue = (key: string) => {
  const index = key ? key.lastIndexOf('/') : -1;
  return index > 0 ? key.substring(index + 1) : null;
};

/**
 * @date 3/16/2022 - 10:08:55 AM
 * Find in a {LabelsOrAnnotationsMap} object a key that start with {keyPrefix} prefix after '/' in label
 * @param {LabelsOrAnnotationsMap} obj - object to search
 * @param {string} keyPrefix - prefix to search
 * @returns {*}
 */
export const findKeySuffixValue = (obj: LabelsOrAnnotationsMap, keyPrefix: string) =>
  getSuffixValue(getPrefixedKey(obj, keyPrefix));

/**
 * @date 3/16/2022 - 10:08:55 AM
 * Find in a {LabelsOrAnnotationsMap} object a label that start with {keyPrefix}
 * @param {LabelsOrAnnotationsMap} obj - object to search
 * @param {string} keyPrefix - prefix to search
 * @returns {string}
 */
export const getValueByPrefix = (obj: LabelsOrAnnotationsMap, keyPrefix: string): string => {
  const objectKey = Object.keys(obj || {}).find((key) => key.startsWith(keyPrefix));
  return objectKey ? obj[objectKey] : null;
};

/**
 * @date 3/16/2022 - 10:08:55 AM
 * Get os from {obj}
 * @param {K8sResourceCommon} obj - object to search
 * @returns {string}
 */
export const getOperatingSystem = (obj: K8sResourceCommon): string =>
  findKeySuffixValue(obj?.metadata?.labels, OS_TEMPLATE_LABEL) ||
  obj?.metadata?.annotations?.[VM_OS_ANNOTATION];

/**
 * @date 3/16/2022 - 10:08:55 AM
 * Get os name from {obj}
 * @param {K8sResourceCommon} obj - object to search
 * @returns {string}
 */
export const getOperatingSystemName = (obj: K8sResourceCommon): string =>
  getValueByPrefix(
    obj?.metadata?.annotations,
    `${NAME_OS_TEMPLATE_ANNOTATION}/${getOperatingSystem(obj)}`,
  );

/**
 * Windows os prefix
 * @date 4/20/2022 - 1:58:24 PM
 *
 * @type {"win"}
 */
export const OS_WINDOWS_PREFIX = 'win';

/**
 * Check if a vm/vmi is running windows
 * @date 4/20/2022 - 1:58:24 PM
 *
 * @param {K8sResourceCommon} obj - object to search
 * @returns {boolean}
 */

export const isWindows = (obj: K8sResourceCommon): boolean =>
  (getOperatingSystem(obj) || '')?.startsWith(OS_WINDOWS_PREFIX);
