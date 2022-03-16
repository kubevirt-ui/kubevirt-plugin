import { NAME_OS_TEMPLATE_ANNOTATION, OS_TEMPLATE_LABEL } from '@kubevirt-utils/resources/vm';
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
 * @param {LabelsOrAnnotationsMap} obj
 * @param {string} keyPrefix
 * @returns {*}
 */
const getPrefixedKey = (obj: LabelsOrAnnotationsMap, keyPrefix: string) =>
  obj ? Object.keys(obj).find((key) => key.startsWith(keyPrefix)) : null;

/**
 * @date 3/16/2022 - 10:08:55 AM
 * Get a value after '/' from a {key}
 * @param {string} key
 * @returns {*}
 */
const getSuffixValue = (key: string) => {
  const index = key ? key.lastIndexOf('/') : -1;
  return index > 0 ? key.substring(index + 1) : null;
};

/**
 * @date 3/16/2022 - 10:08:55 AM
 * Find in a {LabelsOrAnnotationsMap} object a key that start with {keyPrefix} prefix after '/' in label
 * @param {LabelsOrAnnotationsMap} obj
 * @param {string} keyPrefix
 * @returns {*}
 */
export const findKeySuffixValue = (obj: LabelsOrAnnotationsMap, keyPrefix: string) =>
  getSuffixValue(getPrefixedKey(obj, keyPrefix));

/**
 * @date 3/16/2022 - 10:08:55 AM
 * Find in a {LabelsOrAnnotationsMap} object a label that start with {keyPrefix}
 * @param {LabelsOrAnnotationsMap} obj
 * @param {string} keyPrefix
 * @returns {string}
 */
export const getValueByPrefix = (obj: LabelsOrAnnotationsMap, keyPrefix: string): string => {
  const objectKey = Object.keys(obj || {}).find((key) => key.startsWith(keyPrefix));
  return objectKey ? obj[objectKey] : null;
};

/**
 * @date 3/16/2022 - 10:08:55 AM
 * Get os from {obj}
 * @param {K8sResourceCommon} obj
 * @returns {string}
 */
export const getOperatingSystem = (obj: K8sResourceCommon): string =>
  findKeySuffixValue(obj?.metadata?.labels, OS_TEMPLATE_LABEL);

/**
 * @date 3/16/2022 - 10:08:55 AM
 * Get os name from {obj}
 * @param {K8sResourceCommon} obj
 * @returns {string}
 */
export const getOperatingSystemName = (obj: K8sResourceCommon) =>
  getValueByPrefix(
    obj?.metadata?.annotations,
    `${NAME_OS_TEMPLATE_ANNOTATION}/${getOperatingSystem(obj)}`,
  );
