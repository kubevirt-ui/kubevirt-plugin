import { VMT_PATH_SEGMENT } from '@templates/constants';

import { getFleetTemplatesURL } from './fleetPageUrls';

export const getFleetTemplateURL = (name: string, namespace: string, cluster: string): string =>
  `${getFleetTemplatesURL(cluster, namespace)}/${name}`;

export const getFleetVMTemplateURL = (name: string, namespace: string, cluster: string): string =>
  `${getFleetTemplatesURL(cluster, namespace)}/${VMT_PATH_SEGMENT}/${name}`;
