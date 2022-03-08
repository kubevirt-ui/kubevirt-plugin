import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

import { NAME_OS_TEMPLATE_ANNOTATION, OS_TEMPLATE_LABEL } from '../../../../utils/constants';

type LabelsOrAnnotationsMap = {
  [key: string]: string;
};

const getPrefixedKey = (obj: LabelsOrAnnotationsMap, keyPrefix: string) =>
  obj ? Object.keys(obj).find((key) => key.startsWith(keyPrefix)) : null;

const getSuffixValue = (key: string) => {
  const index = key ? key.lastIndexOf('/') : -1;
  return index > 0 ? key.substring(index + 1) : null;
};

export const findKeySuffixValue = (obj: LabelsOrAnnotationsMap, keyPrefix: string) =>
  getSuffixValue(getPrefixedKey(obj, keyPrefix));

export const getValueByPrefix = (obj: LabelsOrAnnotationsMap, keyPrefix: string): string => {
  const objectKey = Object.keys(obj || {}).find((key) => key.startsWith(keyPrefix));
  return objectKey ? obj[objectKey] : null;
};

export const getOperatingSystem = (obj: K8sResourceCommon): string =>
  findKeySuffixValue(obj?.metadata?.labels, OS_TEMPLATE_LABEL);
export const getOperatingSystemName = (obj: K8sResourceCommon) =>
  getValueByPrefix(
    obj?.metadata?.annotations,
    `${NAME_OS_TEMPLATE_ANNOTATION}/${getOperatingSystem(obj)}`,
  );
