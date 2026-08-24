import { load as yamlLoad } from 'js-yaml';

import type RequestContextClient from '@/clients/request-context-client';
import { VirtualMachineFactory, type VirtualMachineConfig } from '@/data-factories';
import type { KubernetesResource } from '@/data-models/kubernetes-types';
import { TestTimeouts } from '@/utils/test-config';
import { waitForCondition } from '@/utils/wait-helpers';

export async function createHaltedVm(
  apiClient: RequestContextClient,
  config: Partial<VirtualMachineConfig> = {},
): Promise<void> {
  const yaml = VirtualMachineFactory.create({
    ...config,
    ...(config.osLabel || config.os ? { osLabel: config.osLabel ?? config.os } : {}),
    runStrategy: 'Halted',
  });
  const payload = yamlLoad(yaml) as KubernetesResource;
  const name = payload.metadata?.name;
  const namespace = payload.metadata?.namespace ?? config.namespace;
  if (!name || !namespace) {
    throw new Error('createHaltedVm requires name and namespace');
  }
  await apiClient.createVirtualMachine(namespace, payload);
  await apiClient.waitForVmExists(name, namespace);
  apiClient.trackResource('VirtualMachine', name, namespace);
}

export async function waitForVmPrintableStatus(
  apiClient: RequestContextClient,
  namespace: string,
  vmName: string,
  status: string,
): Promise<void> {
  const reached = await waitForCondition(
    async () => {
      const vm = await apiClient.getVirtualMachine(namespace, vmName);
      return vm?.status?.printableStatus === status;
    },
    TestTimeouts.RESOURCE_CREATION,
    TestTimeouts.POLLING_INTERVAL,
  );
  if (!reached) {
    throw new Error(`VM ${vmName} did not reach printableStatus ${status}`);
  }
}

export async function cleanupVmFixtures(
  apiClient: RequestContextClient,
  namespace: string,
  vmNames: Array<string | undefined>,
): Promise<void> {
  const cleanupErrors: string[] = [];
  for (const vmName of vmNames) {
    if (!vmName) {
      continue;
    }
    try {
      await apiClient.deleteVirtualMachine(namespace, vmName);
      await apiClient.waitForVmDeleted(vmName, namespace);
    } catch (error) {
      cleanupErrors.push(`${vmName}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  if (cleanupErrors.length > 0) {
    throw new Error(`Failed to clean up VM fixtures: ${cleanupErrors.join('; ')}`);
  }
}
