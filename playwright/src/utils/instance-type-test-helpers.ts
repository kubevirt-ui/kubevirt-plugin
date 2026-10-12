import type RequestContextClient from '@/clients/request-context-client';
import { TestTimeouts } from '@/utils/test-config';

const IT_GROUP = 'instancetype.kubevirt.io';
const IT_VERSION = 'v1beta1';

export { IT_GROUP, IT_VERSION };

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
