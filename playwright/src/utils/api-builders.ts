import type { KubernetesListResource, KubernetesResource } from '@/data-models/kubernetes-types';

/** Label key used to associate a VM with a folder. */
export const FOLDER_LABEL = 'vm.openshift.io/folder';

/**
 * Builds an OpenShift Template object from an existing VirtualMachine resource.
 * Strips runtime-only metadata fields and wraps the VM spec in a Template with
 * a parameterised NAME field.
 */
export function buildTemplateFromVm(
  vm: KubernetesResource,
  templateName: string,
  displayName: string,
): KubernetesResource {
  const vmCopy = JSON.parse(JSON.stringify(vm)) as KubernetesResource;

  vmCopy.metadata = vmCopy.metadata ?? {};

  delete vmCopy.metadata.resourceVersion;
  delete vmCopy.metadata.uid;
  delete vmCopy.metadata.creationTimestamp;
  delete vmCopy.metadata.generation;
  delete vmCopy.metadata.managedFields;
  delete vmCopy.status;

  vmCopy.metadata.name = '${NAME}';

  return {
    apiVersion: 'template.openshift.io/v1',
    kind: 'Template',
    metadata: {
      name: templateName,
      namespace: vmCopy.metadata.namespace,
      labels: {
        'template.kubevirt.io/type': 'vm',
        'vm.kubevirt.io/template.version': 'v0.27.0',
      },
      annotations: {
        'openshift.io/display-name': displayName,
        description: `Template saved from VM ${vm.metadata?.name ?? 'unknown'}`,
      },
    },
    parameters: [
      {
        name: 'NAME',
        description: 'Name for the new VM',
        generate: 'expression',
        from: `${templateName}-[a-z0-9]{8}`,
      },
    ],
    objects: [vmCopy],
  };
}

/**
 * Returns all VMs in `namespace` whose folder label matches `folderName`.
 */
export async function listVmsInFolder(
  apiClient: {
    getVirtualMachines: (ns: string) => Promise<KubernetesListResource<KubernetesResource>>;
  },
  namespace: string,
  folderName: string,
): Promise<KubernetesResource[]> {
  const list = await apiClient.getVirtualMachines(namespace);
  return (list.items ?? []).filter((vm) => vm.metadata?.labels?.[FOLDER_LABEL] === folderName);
}
