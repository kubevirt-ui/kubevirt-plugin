import startCase from 'lodash.startcase';

import { K8sKind } from '@openshift-console/dynamic-plugin-sdk';
import { getK8sModel } from '@openshift-console/dynamic-plugin-sdk/lib/utils/k8s/hooks/useK8sModel';

const abbrBlacklist = ['ASS'];
export const kindToAbbr = (kind) => {
  const abbrKind = (kind.replace(/[^A-Z]/g, '') || kind.toUpperCase()).slice(0, 4);
  return abbrBlacklist.includes(abbrKind) ? abbrKind.slice(0, -1) : abbrKind;
};

export const labelForNodeKind = (kindString: string) => {
  const model: K8sKind | undefined = getK8sModel(kindString);
  if (model) {
    return model.label;
  }
  return startCase(kindString);
};

export const getPluralLabel = (kind: string, plural: string) => kind + plural.slice(kind.length);

export const getFieldId = (fieldName: string, fieldType: string) => {
  return `form-${fieldType}-${fieldName?.replace(/\./g, '-')}-field`;
};
