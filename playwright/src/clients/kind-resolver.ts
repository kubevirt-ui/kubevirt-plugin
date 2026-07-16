/** Maps Kubernetes resource kind strings to their full GVR tuples for backward-compatible kind-based API access. */

export type GvrTuple = { group: string; version: string; plural: string };

const KIND_MAP = new Map<string, GvrTuple>([
  // Core (group: '', version: 'v1')
  ['namespace', { group: '', version: 'v1', plural: 'namespaces' }],
  ['pod', { group: '', version: 'v1', plural: 'pods' }],
  ['secret', { group: '', version: 'v1', plural: 'secrets' }],
  ['configmap', { group: '', version: 'v1', plural: 'configmaps' }],
  ['persistentvolumeclaim', { group: '', version: 'v1', plural: 'persistentvolumeclaims' }],
  ['pvc', { group: '', version: 'v1', plural: 'persistentvolumeclaims' }],
  ['node', { group: '', version: 'v1', plural: 'nodes' }],
  ['serviceaccount', { group: '', version: 'v1', plural: 'serviceaccounts' }],

  // KubeVirt (group: 'kubevirt.io', version: 'v1')
  ['virtualmachine', { group: 'kubevirt.io', version: 'v1', plural: 'virtualmachines' }],
  ['vm', { group: 'kubevirt.io', version: 'v1', plural: 'virtualmachines' }],
  [
    'virtualmachineinstance',
    { group: 'kubevirt.io', version: 'v1', plural: 'virtualmachineinstances' },
  ],
  ['vmi', { group: 'kubevirt.io', version: 'v1', plural: 'virtualmachineinstances' }],
  [
    'virtualmachineinstancemigration',
    { group: 'kubevirt.io', version: 'v1', plural: 'virtualmachineinstancemigrations' },
  ],
  ['vmim', { group: 'kubevirt.io', version: 'v1', plural: 'virtualmachineinstancemigrations' }],
  ['kubevirt', { group: 'kubevirt.io', version: 'v1', plural: 'kubevirts' }],

  // Instance types (group: 'instancetype.kubevirt.io', version: 'v1beta1')
  [
    'virtualmachineinstancetype',
    {
      group: 'instancetype.kubevirt.io',
      version: 'v1beta1',
      plural: 'virtualmachineinstancetypes',
    },
  ],
  [
    'virtualmachineclusterinstancetype',
    {
      group: 'instancetype.kubevirt.io',
      version: 'v1beta1',
      plural: 'virtualmachineclusterinstancetypes',
    },
  ],
  [
    'virtualmachinepreference',
    { group: 'instancetype.kubevirt.io', version: 'v1beta1', plural: 'virtualmachinepreferences' },
  ],
  [
    'virtualmachineclusterpreference',
    {
      group: 'instancetype.kubevirt.io',
      version: 'v1beta1',
      plural: 'virtualmachineclusterpreferences',
    },
  ],

  // Snapshots (group: 'snapshot.kubevirt.io', version: 'v1beta1')
  [
    'virtualmachinesnapshot',
    { group: 'snapshot.kubevirt.io', version: 'v1beta1', plural: 'virtualmachinesnapshots' },
  ],
  [
    'virtualmachinerestore',
    { group: 'snapshot.kubevirt.io', version: 'v1beta1', plural: 'virtualmachinerestores' },
  ],

  // CDI (group: 'cdi.kubevirt.io', version: 'v1beta1')
  ['datavolume', { group: 'cdi.kubevirt.io', version: 'v1beta1', plural: 'datavolumes' }],
  ['datasource', { group: 'cdi.kubevirt.io', version: 'v1beta1', plural: 'datasources' }],
  ['dataimportcron', { group: 'cdi.kubevirt.io', version: 'v1beta1', plural: 'dataimportcrons' }],
  ['storageprofile', { group: 'cdi.kubevirt.io', version: 'v1beta1', plural: 'storageprofiles' }],
  ['cdiconfig', { group: 'cdi.kubevirt.io', version: 'v1beta1', plural: 'cdiconfigs' }],

  // OpenShift - Templates
  ['template', { group: 'template.openshift.io', version: 'v1', plural: 'templates' }],

  // OpenShift - Projects
  ['project', { group: 'project.openshift.io', version: 'v1', plural: 'projects' }],

  // OpenShift - Config
  ['clusterversion', { group: 'config.openshift.io', version: 'v1', plural: 'clusterversions' }],

  // OpenShift - Console
  ['consoleplugin', { group: 'console.openshift.io', version: 'v1', plural: 'consoleplugins' }],

  // RBAC (group: 'rbac.authorization.k8s.io', version: 'v1')
  ['clusterrole', { group: 'rbac.authorization.k8s.io', version: 'v1', plural: 'clusterroles' }],
  [
    'clusterrolebinding',
    { group: 'rbac.authorization.k8s.io', version: 'v1', plural: 'clusterrolebindings' },
  ],
  ['rolebinding', { group: 'rbac.authorization.k8s.io', version: 'v1', plural: 'rolebindings' }],

  // Migration (group: 'migrations.kubevirt.io', version: 'v1alpha1')
  [
    'migrationpolicy',
    { group: 'migrations.kubevirt.io', version: 'v1alpha1', plural: 'migrationpolicies' },
  ],
  [
    'virtualmachinestoragemigrationplan',
    {
      group: 'migrations.kubevirt.io',
      version: 'v1alpha1',
      plural: 'virtualmachinestoragemigrationplans',
    },
  ],
  [
    'migplan',
    {
      group: 'migrations.kubevirt.io',
      version: 'v1alpha1',
      plural: 'virtualmachinestoragemigrationplans',
    },
  ],

  // HCO (group: 'hco.kubevirt.io', version: 'v1beta1')
  ['hyperconverged', { group: 'hco.kubevirt.io', version: 'v1beta1', plural: 'hyperconvergeds' }],

  // Storage
  ['storageclass', { group: 'storage.k8s.io', version: 'v1', plural: 'storageclasses' }],
  [
    'volumesnapshot',
    { group: 'snapshot.storage.k8s.io', version: 'v1', plural: 'volumesnapshots' },
  ],

  // Networking
  [
    'networkattachmentdefinition',
    { group: 'k8s.cni.cncf.io', version: 'v1', plural: 'network-attachment-definitions' },
  ],
  [
    'net-attach-def',
    { group: 'k8s.cni.cncf.io', version: 'v1', plural: 'network-attachment-definitions' },
  ],

  // API Extensions
  [
    'customresourcedefinition',
    { group: 'apiextensions.k8s.io', version: 'v1', plural: 'customresourcedefinitions' },
  ],
]);

export function resolveKind(kind: string): GvrTuple {
  const gvr = KIND_MAP.get(kind.toLowerCase());

  if (!gvr) {
    throw new Error(
      `Unknown resource kind "${kind}". Add it to kind-resolver.ts if this is a valid resource.`,
    );
  }

  return gvr;
}
