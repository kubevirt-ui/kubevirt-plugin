import type RequestContextClient from '@/clients/request-context-client';
import { TestTimeouts } from '@/utils/test-config';

const IT_GROUP = 'instancetype.kubevirt.io';
const IT_VERSION = 'v1beta1';
const FEATURES_CONFIG_MAP_NAME = 'kubevirt-ui-features';
export const DISABLED_INSTANCE_TYPE_FAMILIES_KEY = 'disabledInstanceTypeFamilies';

export { IT_GROUP, IT_VERSION };

export const parseDisabledInstanceTypeFamiliesFromConfigMap = (raw?: string): string[] => {
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
  } catch {
    return [];
  }
};

export async function getDisabledInstanceTypeFamilies(
  client: RequestContextClient,
  namespace: string,
): Promise<string[]> {
  const configMap = await client.getConfigMap(FEATURES_CONFIG_MAP_NAME, namespace);
  const data = configMap?.data as Record<string, string> | undefined;
  return parseDisabledInstanceTypeFamiliesFromConfigMap(data?.[DISABLED_INSTANCE_TYPE_FAMILIES_KEY]);
}

export async function setDisabledInstanceTypeFamilies(
  client: RequestContextClient,
  namespace: string,
  families: string[],
): Promise<void> {
  const serialized = JSON.stringify([...new Set(families)].sort((a, b) => a.localeCompare(b)));
  await client.mergePatchResource(
    '',
    'v1',
    'configmaps',
    FEATURES_CONFIG_MAP_NAME,
    { data: { [DISABLED_INSTANCE_TYPE_FAMILIES_KEY]: serialized } },
    namespace,
  );
}

export async function createClusterInstanceTypeApi(
  client: RequestContextClient,
  name: string,
  cpu = 1,
  memory = '1Gi',
): Promise<void> {
  const instanceTypeResource = {
    apiVersion: `${IT_GROUP}/${IT_VERSION}`,
    kind: 'VirtualMachineClusterInstancetype',
    metadata: {
      name,
      labels: {
        'app.kubernetes.io/managed-by': 'playwright-test',
      },
    },
    spec: {
      cpu: { guest: cpu },
      memory: { guest: memory },
    },
  };
  await client.createVirtualMachineClusterInstanceType(instanceTypeResource);
  client.trackResource('VirtualMachineClusterInstanceType', name);
}

export async function createNamespacedInstanceTypeApi(
  client: RequestContextClient,
  name: string,
  namespace: string,
  cpu = 1,
  memory = '512Mi',
): Promise<void> {
  const resource = {
    apiVersion: `${IT_GROUP}/${IT_VERSION}`,
    kind: 'VirtualMachineInstancetype',
    metadata: {
      name,
      namespace,
      labels: { 'app.kubernetes.io/managed-by': 'playwright-test' },
    },
    spec: {
      cpu: { guest: cpu },
      memory: { guest: memory },
    },
  };
  await client.createVirtualMachineInstanceType(namespace, resource);
  client.trackResource('VirtualMachineInstanceType', name, namespace);
}

export async function verifyInstanceTypeDeletedCluster(
  client: RequestContextClient,
  name: string,
  timeoutMs = TestTimeouts.DEFAULT,
): Promise<{ deleted: boolean }> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const resource = await client
      .getResourceByKind('virtualmachineclusterinstancetype', name)
      .catch(() => null);
    if (resource === null) return { deleted: true };
    await new Promise((r) => setTimeout(r, TestTimeouts.SHORT_WAIT));
  }
  return { deleted: false };
}

export async function namespacedInstanceTypeExists(
  client: RequestContextClient,
  namespace: string,
  name: string,
): Promise<boolean> {
  const resource = await client
    .getResourceByKind('virtualmachineinstancetype', name, namespace)
    .catch(() => null);
  return resource !== null;
}
