import { env } from './env';

/** Build a namespaced resource list URL. */
export const resourceUrl = (gvk: string, ns?: string) =>
  `/k8s/${ns ? `ns/${ns}` : 'all-namespaces'}/${gvk}`;

/** Build a cluster-scoped resource list URL. */
export const clusterResourceUrl = (gvk: string) => `/k8s/cluster/${gvk}`;

export const urls = {
  bootableVolumes: (ns = env.osImagesNamespace) => resourceUrl('bootablevolumes', ns),
  checkups: (ns = env.cnvNamespace) => `/k8s/ns/${ns}/checkups`,
  instanceTypes: () =>
    clusterResourceUrl('instancetype.kubevirt.io~v1beta1~VirtualMachineClusterInstancetype'),
  migrationPolicies: () => clusterResourceUrl('migrations.kubevirt.io~v1alpha1~MigrationPolicy'),
  networking: (ns?: string) => resourceUrl('k8s.cni.cncf.io~v1~NetworkAttachmentDefinition', ns),
  settings: (ns = env.cnvNamespace) => `/k8s/ns/${ns}/virtualization-settings`,
  storageClasses: () => clusterResourceUrl('storage.k8s.io~v1~StorageClass'),
  templates: (ns?: string) => resourceUrl('templates.openshift.io~v1~Template', ns),
  vms: (ns?: string) => resourceUrl('kubevirt.io~v1~VirtualMachine', ns),
};
