/**
 * Shared helpers for setting up test infrastructure (namespaces, VMs, labels, etc.).
 */

import type KubernetesClient from '@/clients/kubernetes-client';
import {
  generateRandomName,
  generateRandomString,
  generateTestNamespace,
} from '@/utils/random-data-generator';
import { TestTimeouts } from '@/utils/test-config';

/**
 * Create a test namespace with a generated name, wait for it to be active, and
 * register it for automatic cleanup.
 */
export async function setupTestNamespace(
  k8sClient: KubernetesClient,
  prefix: string,
): Promise<string> {
  const namespace = generateTestNamespace(prefix);
  await k8sClient.createNamespace(namespace);
  await k8sClient.waitForNamespaceReady(namespace, TestTimeouts.NAMESPACE_READY);
  k8sClient.trackResource('Namespace', namespace);
  return namespace;
}

export interface AdvancedSearchVmNames {
  defaultVm: string;
  templateVm: string;
  instanceTypeVm: string;
  searchTerm: string;
}

interface CreateAdvancedSearchTestVmsOptions {
  testPrefix?: string;
  startVms?: boolean;
  templateName?: string;
  bootableVolumeName?: string;
  /**
   * When true, default and template VMs are created with 4Gi memory (via template customization)
   * so that memory filter "<= 2Gi" only matches the instance-type VM (U-small, 2Gi).
   * Use for tests that filter by memory (e.g. CNV-11958).
   */
  memorySearch?: boolean;
}

function generateUniqueSuffix(): string {
  return generateRandomString(6, 'alphanumeric').toLowerCase();
}

async function addVmLabel(
  client: KubernetesClient,
  labelKey: string,
  labelValue: string,
  vmName: string,
  namespace: string,
): Promise<void> {
  const vm = await client.getVirtualMachine(vmName, namespace);
  if (!vm) {
    throw new Error(`VM '${vmName}' not found in namespace '${namespace}'`);
  }
  const escapedKey = labelKey.replace(/~/g, '~0').replace(/\//g, '~1');
  const patchOps: Array<{ op: string; path: string; value?: unknown }> = [];
  if (!vm.metadata?.labels) {
    patchOps.push({ op: 'add', path: '/metadata/labels', value: { [labelKey]: labelValue } });
  } else {
    patchOps.push({ op: 'add', path: `/metadata/labels/${escapedKey}`, value: labelValue });
  }
  await client.patchResource('kubevirt.io', 'v1', 'virtualmachines', vmName, namespace, patchOps);
}

async function addVmAnnotation(
  client: KubernetesClient,
  annotationKey: string,
  annotationValue: string,
  vmName: string,
  namespace: string,
): Promise<void> {
  const vm = await client.getVirtualMachine(vmName, namespace);
  if (!vm) {
    throw new Error(`VM '${vmName}' not found in namespace '${namespace}'`);
  }
  const escapedKey = annotationKey.replace(/~/g, '~0').replace(/\//g, '~1');
  const patchOps: Array<{ op: string; path: string; value?: unknown }> = [];
  if (!vm.metadata?.annotations) {
    patchOps.push({
      op: 'add',
      path: '/metadata/annotations',
      value: { [annotationKey]: annotationValue },
    });
  } else {
    patchOps.push({
      op: 'add',
      path: `/metadata/annotations/${escapedKey}`,
      value: annotationValue,
    });
  }
  await client.patchResource('kubevirt.io', 'v1', 'virtualmachines', vmName, namespace, patchOps);
}

export async function createAdvancedSearchTestVms(
  k8sClient: KubernetesClient,
  namespace: string,
  options: CreateAdvancedSearchTestVmsOptions = {},
): Promise<AdvancedSearchVmNames> {
  const {
    testPrefix = 'test',
    startVms = false,
    templateName = 'fedora-server-small',
    bootableVolumeName = 'fedora',
    memorySearch = false,
  } = options;

  const templateVmCustomization = memorySearch ? { memory: 4 } : undefined;

  const uniquePrefix = `${testPrefix}${generateUniqueSuffix()}`;

  const defaultVmName = generateRandomName(`search-default-${uniquePrefix}`);
  const templateVmName = generateRandomName(`search-template-${uniquePrefix}`);
  const instanceTypeVmName = generateRandomName(`search-it-${uniquePrefix}`);

  await k8sClient.createVmFromTemplate(
    templateName,
    defaultVmName,
    namespace,
    'openshift',
    startVms,
    undefined,
    undefined,
    templateVmCustomization,
  );
  k8sClient.trackResource('VirtualMachine', defaultVmName, namespace);

  await k8sClient.createVmFromTemplate(
    templateName,
    templateVmName,
    namespace,
    'openshift',
    startVms,
    undefined,
    undefined,
    templateVmCustomization,
  );
  k8sClient.trackResource('VirtualMachine', templateVmName, namespace);

  await addVmLabel(k8sClient, 'template', 'true', templateVmName, namespace);
  await addVmAnnotation(k8sClient, 'description', 'Customized', templateVmName, namespace);

  await k8sClient.createVmFromInstanceType(
    bootableVolumeName,
    instanceTypeVmName,
    namespace,
    'U series',
    'small',
    startVms,
  );
  k8sClient.trackResource('VirtualMachine', instanceTypeVmName, namespace);

  await addVmLabel(k8sClient, 'instancetype', 'true', instanceTypeVmName, namespace);
  await addVmAnnotation(k8sClient, 'description', 'Customized', instanceTypeVmName, namespace);

  return {
    defaultVm: defaultVmName,
    templateVm: templateVmName,
    instanceTypeVm: instanceTypeVmName,
    searchTerm: uniquePrefix,
  };
}
