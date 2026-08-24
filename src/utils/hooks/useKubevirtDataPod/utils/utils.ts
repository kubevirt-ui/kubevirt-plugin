import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  type K8sResourceCommon,
  type WatchK8sResource,
} from '@openshift-console/dynamic-plugin-sdk';

import { PROXY_KUBEVIRT_URL } from './constants';

const rsMapper: Record<string, number> = {};

export const registerResourceVersion = (key: string, resourceVersion: string): void => {
  const resourceVersionNumber = Number(resourceVersion);
  rsMapper[key] = resourceVersionNumber < rsMapper[key] ? rsMapper[key] : resourceVersionNumber;
};

export const getResourceVersion = (key: string): number | undefined => rsMapper[key];

export const constructURL = (watchOptions: WatchK8sResource, query?: string): string => {
  const { groupVersionKind, name, namespace } = watchOptions || {};
  const baseUrl = `${PROXY_KUBEVIRT_URL}apis/${groupVersionKind?.group}/${groupVersionKind?.version}/`;
  const namespacePart = namespace ? `namespaces/${namespace}/` : '';
  const namePart = !name ? 's' : `/${name}`;
  const kindUrl = groupVersionKind?.kind.toLowerCase();
  const appendedQuery = !isEmpty(query) ? `?${query}` : '';

  return `${baseUrl}${namespacePart}${kindUrl}${namePart}${appendedQuery}`;
};

export const compareNameAndNamespace = (
  obj: K8sResourceCommon,
  compObj: K8sResourceCommon,
): boolean => {
  return getNamespace(obj) === getNamespace(compObj) && getName(obj) === getName(compObj);
};
