/**
 * Data factory for VirtualMachineSnapshot YAML and resource serialization.
 * Used to produce full YAML for the snapshot edit form (e.g. from API resource).
 */

import { dump as yamlDump } from 'js-yaml';

import type { KubernetesResource } from '@/data-models/kubernetes-types';

export interface VirtualMachineSnapshotEditConfig {
  name: string;
  namespace: string;
  vmName: string;
}

/**
 * Converts a VirtualMachineSnapshot resource object (from Kubernetes API) to YAML string
 * for use in the edit form. Ensures the full structure (metadata, spec, status, managedFields, etc.)
 * is preserved so the form receives the same shape as loaded from the console.
 */
export function createVirtualMachineSnapshotYamlFromResource(resource: KubernetesResource): string {
  const plain = JSON.parse(JSON.stringify(resource));
  return yamlDump(plain, { indent: 2, lineWidth: -1 });
}

/**
 * Creates minimal VirtualMachineSnapshot YAML for the edit form when the full resource
 * is not available. Prefer createVirtualMachineSnapshotYamlFromResource when the
 * snapshot has been fetched from the API so the full YAML (including status, managedFields)
 * is processed.
 */
export function createMinimalVirtualMachineSnapshotYaml(
  config: VirtualMachineSnapshotEditConfig,
): string {
  const { name, namespace, vmName } = config;
  return `apiVersion: snapshot.kubevirt.io/v1beta1
kind: VirtualMachineSnapshot
metadata:
  name: ${name}
  namespace: ${namespace}
spec:
  source:
    apiGroup: kubevirt.io
    kind: VirtualMachine
    name: ${vmName}
`;
}
