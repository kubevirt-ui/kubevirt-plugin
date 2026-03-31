import { FLEET_TEMPLATES_PATH } from '@multicluster/constants';

export const getTemplateURL = (name: string, namespace: string, cluster?: string): string =>
  cluster
    ? `${FLEET_TEMPLATES_PATH}/cluster/${cluster}/ns/${namespace}/${name}`
    : `/k8s/ns/${namespace}/templates/${name}`;

export const getTemplateListURL = (namespace?: string): string =>
  namespace ? `/k8s/ns/${namespace}/templates` : `/k8s/all-namespaces/templates`;

export const getACMTemplateListURL = (): string =>
  `${FLEET_TEMPLATES_PATH}/all-clusters/all-namespaces`;
