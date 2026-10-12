import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { isAllNamespaces } from '@kubevirt-utils/utils/utils';
import { FLEET_TEMPLATES_PATH } from '@multicluster/constants';
import { getFleetTemplateURL, getFleetVMTemplateURL } from '@multicluster/urls';
import { VM_TEMPLATES_PATH_SEGMENT, VMT_PATH_SEGMENT } from '@templates/constants';

export const getTemplateURL = (name: string, namespace: string, cluster?: string): string =>
  cluster
    ? getFleetTemplateURL(name, namespace, cluster)
    : `/k8s/ns/${namespace}/${VM_TEMPLATES_PATH_SEGMENT}/${name}`;

export const getVMTemplateURL = (name: string, namespace: string, cluster?: string): string =>
  cluster
    ? getFleetVMTemplateURL(name, namespace, cluster)
    : `/k8s/ns/${namespace}/${VM_TEMPLATES_PATH_SEGMENT}/${VMT_PATH_SEGMENT}/${name}`;

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
