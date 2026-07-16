/**
 * Helper functions for setting up test data, particularly for advanced search tests.
 * Creates VMs with different characteristics for testing search filters.
 */

import type RequestContextClient from '@/clients/request-context-client';
import type { JsonPatchOp } from '@/data-models/kubernetes-types';
import {
  generateRandomName,
  generateRandomString,
  generateTestNamespace,
} from '@/utils/random-data-generator';
import { TestTimeouts } from '@/utils/test-config';

export type AdvancedSearchVmNames = {
  defaultVm: string;
  templateVm: string;
  instanceTypeVm: string;
  searchTerm: string;
};

type CreateAdvancedSearchTestVmsOptions = {
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
};

function generateUniqueSuffix(): string {
  return generateRandomString(6, 'alphanumeric').toLowerCase();
}

async function addVmLabel(
  client: RequestContextClient,
  labelKey: string,
  labelValue: string,
  vmName: string,
  namespace: string,
): Promise<void> {
  const vm = await client.getVirtualMachine(namespace, vmName);
  if (!vm) {
    throw new Error(`VM '${vmName}' not found in namespace '${namespace}'`);
  }
  const escapedKey = labelKey.replace(/~/g, '~0').replace(/\//g, '~1');
  const patchOps: JsonPatchOp[] = [];
  if (!vm.metadata?.labels) {
    patchOps.push({ op: 'add', path: '/metadata/labels', value: { [labelKey]: labelValue } });
  } else {
    patchOps.push({ op: 'add', path: `/metadata/labels/${escapedKey}`, value: labelValue });
  }
  await client.patchVirtualMachine(namespace, vmName, patchOps);
}

async function addVmAnnotation(
  client: RequestContextClient,
  annotationKey: string,
  annotationValue: string,
  vmName: string,
  namespace: string,
): Promise<void> {
  const vm = await client.getVirtualMachine(namespace, vmName);
  if (!vm) {
    throw new Error(`VM '${vmName}' not found in namespace '${namespace}'`);
  }
  const escapedKey = annotationKey.replace(/~/g, '~0').replace(/\//g, '~1');
  const patchOps: JsonPatchOp[] = [];
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
  await client.patchVirtualMachine(namespace, vmName, patchOps);
}

export async function createAdvancedSearchTestVms(
  client: RequestContextClient,
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

  const uniquePrefix = `${testPrefix}${generateUniqueSuffix()}`;

  const defaultVmName = generateRandomName(`search-default-${uniquePrefix}`);
  const templateVmName = generateRandomName(`search-template-${uniquePrefix}`);
  const instanceTypeVmName = generateRandomName(`search-it-${uniquePrefix}`);

  await client.createVmFromTemplate(templateName, defaultVmName, namespace, 'openshift', startVms);
  client.trackResource('VirtualMachine', defaultVmName, namespace);

  if (memorySearch) {
    const memPatch: JsonPatchOp[] = [
      { op: 'replace', path: '/spec/template/spec/domain/resources/requests/memory', value: '4Gi' },
    ];
    await client.patchVirtualMachine(namespace, defaultVmName, memPatch);
  }

  await client.createVmFromTemplate(templateName, templateVmName, namespace, 'openshift', startVms);
  client.trackResource('VirtualMachine', templateVmName, namespace);

  if (memorySearch) {
    const memPatch: JsonPatchOp[] = [
      { op: 'replace', path: '/spec/template/spec/domain/resources/requests/memory', value: '4Gi' },
    ];
    await client.patchVirtualMachine(namespace, templateVmName, memPatch);
  }

  await addVmLabel(client, 'template', 'true', templateVmName, namespace);
  await addVmAnnotation(client, 'description', 'Customized', templateVmName, namespace);

  await client.createVmFromInstanceType(
    bootableVolumeName,
    instanceTypeVmName,
    namespace,
    'U series',
    'small',
    startVms,
  );
  client.trackResource('VirtualMachine', instanceTypeVmName, namespace);

  await addVmLabel(client, 'instancetype', 'true', instanceTypeVmName, namespace);
  await addVmAnnotation(client, 'description', 'Customized', instanceTypeVmName, namespace);

  return {
    defaultVm: defaultVmName,
    templateVm: templateVmName,
    instanceTypeVm: instanceTypeVmName,
    searchTerm: uniquePrefix,
  };
}

export async function setupTestNamespace(
  client: RequestContextClient,
  prefix: string,
): Promise<string> {
  const namespace = generateTestNamespace(prefix);
  await client.ensureNamespace(namespace);
  await client.waitForNamespaceReady(namespace, TestTimeouts.NAMESPACE_READY);
  client.trackResource('Namespace', namespace);
  return namespace;
}
