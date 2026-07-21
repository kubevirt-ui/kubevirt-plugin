import { VirtualMachineTemplateModelRef } from '@kubevirt-ui-ext/kubevirt-api/console';
import { ALL_NAMESPACES, ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import { FLEET_TEMPLATES_PATH } from '@multicluster/constants';
import { getFleetTemplatesURL } from '@multicluster/urls';

export const getTemplateURL = (name: string, namespace: string, cluster?: string): string =>
  cluster
    ? `${getFleetTemplatesURL(cluster, namespace)}/${name}`
    : `/k8s/ns/${namespace}/templates/${name}`;

export const getVMTemplateURL = (name: string, namespace: string, cluster?: string): string =>
  cluster
    ? `${getFleetTemplatesURL(cluster, namespace)}/vmt/${name}`
    : `/k8s/ns/${namespace}/${VirtualMachineTemplateModelRef}/${name}`;

export const getTemplateListURL = (namespace?: string): string => {
  if (!namespace || namespace === ALL_NAMESPACES || namespace === ALL_NAMESPACES_SESSION_KEY) {
    return `/k8s/all-namespaces/templates`;
  }

  return `/k8s/ns/${namespace}/templates`;
};

export const getACMTemplateListURL = (): string =>
  `${FLEET_TEMPLATES_PATH}/all-clusters/all-namespaces`;
