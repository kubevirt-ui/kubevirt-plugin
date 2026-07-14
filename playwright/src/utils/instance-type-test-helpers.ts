import type KubernetesClient from '@/clients/kubernetes-client';
import { TestTimeouts } from '@/utils/test-config';

const IT_GROUP = 'instancetype.kubevirt.io';
const IT_VERSION = 'v1beta1';

export { IT_GROUP, IT_VERSION };

export async function createClusterInstanceTypeApi(
  k8sClient: KubernetesClient,
  name: string,
  cpu = 1,
  memory = '1Gi',
): Promise<void> {
  const plural = 'virtualmachineclusterinstancetypes';
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
  await k8sClient.createClusterCustomResource(IT_GROUP, IT_VERSION, plural, instanceTypeResource);
  k8sClient.trackResource('VirtualMachineClusterInstanceType', name);
}

export async function createNamespacedInstanceTypeApi(
  k8sClient: KubernetesClient,
  name: string,
  namespace: string,
  cpu = 1,
  memory = '512Mi',
): Promise<void> {
  const plural = 'virtualmachineinstancetypes';
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
  await k8sClient.createCustomResource(IT_GROUP, IT_VERSION, namespace, plural, resource);
  k8sClient.trackResource('VirtualMachineInstanceType', name, namespace);
}

export async function verifyInstanceTypeDeletedCluster(
  k8sClient: KubernetesClient,
  name: string,
  timeoutMs = TestTimeouts.DEFAULT,
): Promise<{ deleted: boolean }> {
  const plural = 'virtualmachineclusterinstancetypes';
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      await k8sClient.getClusterCustomResource(IT_GROUP, IT_VERSION, plural, name);
      await new Promise((r) => setTimeout(r, TestTimeouts.SHORT_WAIT));
    } catch {
      return { deleted: true };
    }
  }
  return { deleted: false };
}

export async function namespacedInstanceTypeExists(
  k8sClient: KubernetesClient,
  namespace: string,
  name: string,
): Promise<boolean> {
  try {
    await k8sClient.getCustomResource(
      IT_GROUP,
      IT_VERSION,
      namespace,
      'virtualmachineinstancetypes',
      name,
    );
    return true;
  } catch {
    return false;
  }
}
