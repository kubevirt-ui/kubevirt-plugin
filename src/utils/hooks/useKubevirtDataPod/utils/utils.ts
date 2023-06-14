import { isEmpty } from '@kubevirt-utils/utils/utils';
import { WatchK8sResource } from '@openshift-console/dynamic-plugin-sdk';

import { PROXY_KUBEVIRT_URL } from './constants';

const rsMapper = {};

export const registerResourceVersion = (key: string, rs: string) => {
  rsMapper[key] = Number(rs < rsMapper?.[key] ? rsMapper?.[key] : rs);
  return;
};
export const getResourceVersion = (key: string) => rsMapper?.[key];

export const constructURL = (watchOptions: WatchK8sResource, query?: string) => {
  const { groupVersionKind, name, namespace } = watchOptions || {};
  const baseUrl = `${PROXY_KUBEVIRT_URL}apis/${groupVersionKind?.group}/${groupVersionKind?.version}/`;
  const namespaceUrl = `${namespace ? `namespaces/${namespace}/` : ''}`;
  const nameUrl = `${!name ? 's' : `/${name}`}`;
  const kindUrl = groupVersionKind?.kind.toLowerCase();
  const appendedQuery = !isEmpty(query) ? `?${query}` : '';

  return `${baseUrl}${namespaceUrl}${kindUrl}${nameUrl}${appendedQuery}`;
};
