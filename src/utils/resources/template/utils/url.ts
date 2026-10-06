import { VirtualMachineTemplateModelRef } from '@kubevirt-ui-ext/kubevirt-api/console';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { ALL_NAMESPACES, ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import { FLEET_TEMPLATES_PATH } from '@multicluster/constants';
import { getFleetTemplatesURL } from '@multicluster/urls';
import { VM_TEMPLATES_PATH_SEGMENT } from '@templates/constants';

const isAllNamespaces = (namespace?: string): boolean =>
  !namespace || namespace === ALL_NAMESPACES || namespace === ALL_NAMESPACES_SESSION_KEY;

export const getTemplateURL = (name: string, namespace: string, cluster?: string): string =>
  cluster
    ? `${getFleetTemplatesURL(cluster, namespace)}/${name}`
    : `/k8s/ns/${namespace}/${VM_TEMPLATES_PATH_SEGMENT}/${name}`;

export const getVMTemplateURL = (name: string, namespace: string, cluster?: string): string =>
  cluster
    ? `${getFleetTemplatesURL(cluster, namespace)}/vmt/${name}`
    : `/k8s/ns/${namespace}/${VirtualMachineTemplateModelRef}/${name}`;

export const getTemplateListURL = (namespace?: string): string => {
  if (isAllNamespaces(namespace)) {
    return `/k8s/all-namespaces/${VM_TEMPLATES_PATH_SEGMENT}`;
  }

  return `/k8s/ns/${namespace}/${VM_TEMPLATES_PATH_SEGMENT}`;
};

/**
 * The create page is registered for namespaced paths only, so fall back to the default
 * namespace when the user is browsing all projects.
 */
export const getTemplateCreateURL = (namespace?: string): string =>
  `/k8s/ns/${isAllNamespaces(namespace) ? DEFAULT_NAMESPACE : namespace}/${VM_TEMPLATES_PATH_SEGMENT}/~new`;

export const getACMTemplateListURL = (): string =>
  `${FLEET_TEMPLATES_PATH}/all-clusters/all-namespaces`;
