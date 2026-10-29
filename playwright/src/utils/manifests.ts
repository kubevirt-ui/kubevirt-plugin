/** Minimal manifests for API setup in Playwright E2E. */

import { assertValidStorageClassName } from '@/utils/k8s-resource-names';

/** Secondary Multus NIC for VM network interface CRUD (OVN overlay). */
export function networkAttachmentDefinitionManifest(opts: {
  name: string;
  namespace: string;
}): string {
  const { name, namespace } = opts;
  return `apiVersion: k8s.cni.cncf.io/v1
kind: NetworkAttachmentDefinition
metadata:
  name: ${name}
  namespace: ${namespace}
spec:
  config: |
    {
      "cniVersion": "0.3.1",
      "name": "${name}",
      "type": "ovn-k8s-cni-overlay"
    }
`;
}

/** Small container-disk VM for live-migration scenarios (fast boot, LiveMigrate eviction). */
export function migratableVirtualMachineManifest(opts: {
  name: string;
  namespace: string;
}): string {
  const { name, namespace } = opts;
  return `apiVersion: kubevirt.io/v1
kind: VirtualMachine
metadata:
  name: ${name}
  namespace: ${namespace}
spec:
  running: false
  template:
    metadata:
      labels:
        kubevirt.io/domain: ${name}
    spec:
      domain:
        devices:
          disks:
          - disk:
              bus: virtio
            name: rootdisk
          interfaces:
          - masquerade: {}
            model: virtio
            name: default
        resources:
          requests:
            memory: 512Mi
      evictionStrategy: LiveMigrate
      networks:
      - name: default
        pod: {}
      volumes:
      - containerDisk:
          image: quay.io/kubevirt/cirros-container-disk-demo
        name: rootdisk
`;
}

export function virtualMachineManifest(opts: { name: string; namespace: string }): string {
  const { name, namespace } = opts;
  return `apiVersion: kubevirt.io/v1
kind: VirtualMachine
metadata:
  labels:
    app: ${name}
    vm.kubevirt.io/template: rhel9-server-small
  name: ${name}
  namespace: ${namespace}
spec:
  dataVolumeTemplates:
  - apiVersion: cdi.kubevirt.io/v1beta1
    kind: DataVolume
    metadata:
      name: ${name}
    spec:
      sourceRef:
        kind: DataSource
        name: rhel9
        namespace: openshift-virtualization-os-images
      storage:
        resources:
          requests:
            storage: 30Gi
  running: false
  template:
    metadata:
      labels:
        kubevirt.io/domain: ${name}
    spec:
      domain:
        cpu:
          cores: 1
          sockets: 1
          threads: 1
        devices:
          disks:
          - disk:
              bus: virtio
            name: rootdisk
          - disk:
              bus: virtio
            name: cloudinitdisk
          interfaces:
          - masquerade: {}
            model: virtio
            name: default
        features:
          smm:
            enabled: true
        firmware:
          bootloader:
            efi: {}
        resources:
          requests:
            memory: 2Gi
      evictionStrategy: LiveMigrate
      networks:
      - name: default
        pod: {}
      volumes:
      - dataVolume:
          name: ${name}
        name: rootdisk
      - cloudInitNoCloud:
          userData: "#cloud-config\\n"
        name: cloudinitdisk
`;
}

export function configMapManifest(opts: { name: string; namespace: string }): string {
  const { name, namespace } = opts;
  return `apiVersion: v1
kind: ConfigMap
metadata:
  name: ${name}
  namespace: ${namespace}
data:
  key: value
`;
}

/** Empty PVC for catalog “clone PVC” disk source (binds via default StorageClass). */
export function persistentVolumeClaimManifest(opts: {
  name: string;
  namespace: string;
  sizeGiB: number;
  storageClassName?: string;
}): string {
  const { name, namespace, sizeGiB, storageClassName } = opts;
  const scLine = storageClassName
    ? `  storageClassName: ${assertValidStorageClassName(storageClassName)}\n`
    : '';
  return `apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: ${name}
  namespace: ${namespace}
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: ${sizeGiB}Gi
${scLine}`;
}

export function dataSourceManifest(opts: {
  annotations?: Record<string, string>;
  labels?: Record<string, string>;
  name: string;
  namespace: string;
}): string {
  const { annotations, labels, name, namespace } = opts;
  const annotationLines =
    annotations && Object.keys(annotations).length
      ? `  annotations:\n${Object.entries(annotations)
          .map(([k, v]) => `    ${k}: ${v}`)
          .join('\n')}\n`
      : '';
  const labelLines =
    labels && Object.keys(labels).length
      ? `  labels:\n${Object.entries(labels)
          .map(([k, v]) => `    ${k}: ${v}`)
          .join('\n')}\n`
      : '';
  return `apiVersion: cdi.kubevirt.io/v1beta1
kind: DataSource
metadata:
  name: ${name}
  namespace: ${namespace}
${labelLines}${annotationLines}spec:
  source:
    registry:
      url: docker://quay.io/containerdisks/centos:7-2009
`;
}

/** Strip `namespace:` — project-scoped Import/~new YAML uses the console project context. */
function stripNamespaceLine(yaml: string): string {
  return yaml.replace(/^[ \t]*namespace:.*(?:\r?\n|$)/m, '');
}

/** YAML for console Import/~new; omit `namespace` (console sets project from URL). */
export function virtualMachineInstancetypeManifest(opts: {
  name: string;
  namespace: string;
}): string {
  const { name, namespace } = opts;
  return `apiVersion: instancetype.kubevirt.io/v1alpha2
kind: VirtualMachineInstancetype
metadata:
  name: ${name}
  namespace: ${namespace}
spec:
  cpu:
    guest: 1
  memory:
    guest: 2Gi
`;
}

/** YAML for console Import/~new; omit \`namespace\` (console sets project from URL). */
export function virtualMachineClusterPreferenceManifest(opts: { name: string }): string {
  const { name } = opts;
  return `apiVersion: instancetype.kubevirt.io/v1alpha2
kind: VirtualMachineClusterPreference
metadata:
  name: ${name}
  annotations:
    openshift.io/display-name: E2E preference
spec:
  devices:
    preferredDiskBus: virtio
    preferredInterfaceModel: virtio
  requirements:
    cpu:
      guest: 1
    memory:
      guest: 2Gi
`;
}

export function virtualMachineClusterPreferenceImportYaml(opts: { name: string }): string {
  return virtualMachineClusterPreferenceManifest(opts);
}

export function virtualMachineInstancetypeImportYaml(opts: {
  name: string;
  namespace?: string;
}): string {
  const { name, namespace } = opts;
  if (namespace) {
    return stripNamespaceLine(virtualMachineInstancetypeManifest({ name, namespace }));
  }
  return `apiVersion: instancetype.kubevirt.io/v1alpha2
kind: VirtualMachineInstancetype
metadata:
  name: ${name}
spec:
  cpu:
    guest: 1
  memory:
    guest: 2Gi
`;
}

export function dataSourceImportYaml(opts: { name: string; namespace?: string }): string {
  const { name, namespace } = opts;
  if (namespace) {
    return stripNamespaceLine(dataSourceManifest({ name, namespace }));
  }
  return `apiVersion: cdi.kubevirt.io/v1beta1
kind: DataSource
metadata:
  name: ${name}
spec:
  source:
    registry:
      url: docker://quay.io/containerdisks/centos:7-2009
`;
}

export function virtualMachineImportYaml(opts: { name: string; namespace?: string }): string {
  const { name, namespace } = opts;
  if (namespace) {
    return stripNamespaceLine(virtualMachineManifest({ name, namespace }));
  }
  return virtualMachineManifest({ name, namespace: 'placeholder' }).replace(
    /^\s*namespace: placeholder\s*\n/m,
    '',
  );
}

/** YAML for console import; pass `namespace` so the object is created in the test project. */
export function openshiftTemplateImportYaml(opts: { name: string; namespace?: string }): string {
  const { name, namespace } = opts;
  if (namespace) {
    return stripNamespaceLine(openshiftTemplateManifest({ name, namespace }));
  }
  return openshiftTemplateManifest({ name, namespace: 'placeholder' }).replace(
    /^\s*namespace: placeholder\s*\n/m,
    '',
  );
}

export function migrationPolicyManifest(opts: { name: string }): string {
  const { name } = opts;
  return `apiVersion: migrations.kubevirt.io/v1alpha1
kind: MigrationPolicy
metadata:
  name: ${name}
spec:
  allowAutoConverge: true
  completionTimeoutPerGiB: 800
  bandwidthPerMigration: 1Gi
  selectors:
    namespaceSelector: {}
    virtualMachineInstanceSelector: {}
`;
}

export function openshiftTemplateManifest(opts: { name: string; namespace: string }): string {
  const { name, namespace } = opts;
  return `apiVersion: template.openshift.io/v1
kind: Template
metadata:
  name: ${name}
  namespace: ${namespace}
  labels:
    app: ${name}
objects:
- apiVersion: kubevirt.io/v1
  kind: VirtualMachine
  metadata:
    name: \${NAME}
  spec:
    running: false
    template:
      spec:
        domain:
          devices:
            disks:
            - disk:
                bus: virtio
              name: rootdisk
            interfaces:
            - masquerade: {}
              model: virtio
              name: default
          resources:
            requests:
              memory: 1Gi
        networks:
        - name: default
          pod: {}
        volumes:
        - containerDisk:
            image: quay.io/kubevirt/cirros-container-disk-demo
          name: rootdisk
parameters:
- name: NAME
  required: true
`;
}
