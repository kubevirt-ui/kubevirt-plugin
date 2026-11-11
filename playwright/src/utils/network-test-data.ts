import type RequestContextClient from '@/clients/request-context-client';
import { generateRandomVmName } from '@/utils/random-data-generator';

const NAD_NAME_MAX_LEN = 40;
const NIC_NAME_MAX_LEN = 15;
const CATALOG_VM_NAME_MAX_LEN = 50;

export function generateNetworkAttachmentDefinitionName(): string {
  return generateRandomVmName('nad').slice(0, NAD_NAME_MAX_LEN);
}

export function generateNetworkInterfaceName(): string {
  return generateRandomVmName('net').slice(0, NIC_NAME_MAX_LEN);
}

export function generateCatalogNetworkVmName(prefix = 'pw-net'): string {
  return generateRandomVmName(prefix).slice(0, CATALOG_VM_NAME_MAX_LEN);
}

export interface NetworkInterfaceTestResources {
  nadName: string;
  secondaryNicName: string;
}

export function generateMultusNicTestResources(): NetworkInterfaceTestResources {
  return {
    nadName: generateNetworkAttachmentDefinitionName(),
    secondaryNicName: generateNetworkInterfaceName(),
  };
}

export async function provisionMigratableVmWithNad(
  apiClient: RequestContextClient,
  namespace: string,
  vmName: string,
  nadName: string,
): Promise<void> {
  await apiClient.deleteNetworkAttachmentDefinition(nadName, namespace).catch(() => undefined);
  await apiClient.deleteVirtualMachine(vmName, namespace);
  await apiClient.applyNetworkAttachmentDefinition(namespace, nadName);
  await apiClient.applyMigratableVirtualMachine(namespace, vmName);
}

export async function teardownMigratableVmWithNad(
  apiClient: RequestContextClient,
  namespace: string,
  vmName: string,
  nadName: string,
): Promise<void> {
  await apiClient.deleteVirtualMachine(vmName, namespace);
  await apiClient.deleteNetworkAttachmentDefinition(nadName, namespace).catch(() => undefined);
}

export async function provisionNetworkAttachmentDefinition(
  apiClient: RequestContextClient,
  namespace: string,
  nadName: string,
): Promise<void> {
  await apiClient.deleteNetworkAttachmentDefinition(nadName, namespace).catch(() => undefined);
  await apiClient.applyNetworkAttachmentDefinition(namespace, nadName);
  await apiClient.waitForNetworkAttachmentDefinition(nadName, namespace);
}

export async function teardownNetworkAttachmentDefinition(
  apiClient: RequestContextClient,
  namespace: string,
  nadName: string,
): Promise<void> {
  await apiClient.deleteNetworkAttachmentDefinition(nadName, namespace).catch(() => undefined);
}
