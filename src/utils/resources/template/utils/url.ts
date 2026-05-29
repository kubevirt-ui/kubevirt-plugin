import { VirtualMachineTemplateModelRef } from '@kubevirt-ui-ext/kubevirt-api/console';
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

export const getTemplateListURL = (namespace?: string): string =>
  namespace ? `/k8s/ns/${namespace}/templates` : `/k8s/all-namespaces/templates`;

export const getACMTemplateListURL = (): string =>
  `${FLEET_TEMPLATES_PATH}/all-clusters/all-namespaces`;
