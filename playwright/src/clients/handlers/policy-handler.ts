import type { KubernetesResource } from '@/data-models/kubernetes-types';
import { getErrorMessage } from '@/data-models/kubernetes-types';
import { TestTimeouts } from '@/utils/test-config';

import { getKubernetesProxyUrl, makeKubernetesProxyRequest } from '../kubernetes-proxy';

import type { KubernetesHandlerContext } from './kubernetes-api-context';
import type { NamespaceHandler } from './namespace-handler';
import type { VirtualMachineHandler } from './vm-handler';

export class PolicyHandler {
  constructor(
    private readonly ctx: KubernetesHandlerContext,
    private readonly namespace: NamespaceHandler,
    private readonly vm: VirtualMachineHandler,
  ) {}

  async deleteNamespacedService(namespace: string, name: string): Promise<void> {
    const proxyUrl = getKubernetesProxyUrl();

    if (proxyUrl) {
      await makeKubernetesProxyRequest(
        this.ctx.kc,
        'DELETE',
        `/api/v1/namespaces/${encodeURIComponent(namespace)}/services/${encodeURIComponent(name)}`,
      );
      return;
    }

    await this.ctx.coreV1Api.deleteNamespacedService({ name, namespace });
  }

  async getClusterVirtualMachineCount(): Promise<number> {
    const namespaces = await this.namespace.getNamespaces();
    let total = 0;
    for (const ns of namespaces) {
      const vms = await this.vm.listVirtualMachines(ns);
      total += vms.length;
    }
    return total;
  }

  async getMigrationPolicy(policyName: string) {
    return await this.ctx.getClusterCustomResource(
      'migrations.kubevirt.io',
      'v1alpha1',
      'migrationpolicies',
      policyName,
    );
  }

  async getNamespaceResourceAllocationForOverview(namespace: string): Promise<{
    runningCount: number;
    vcpu: number;
    memoryMiB: number;
    storageGiB: number;
  }> {
    const vmis = (await this.ctx.listCustomResources(
      'kubevirt.io',
      'v1',
      namespace,
      'virtualmachineinstances',
    )) as KubernetesResource[];
    const running = vmis.filter((v) => v?.status?.phase === 'Running');
    let vcpu = 0;
    let memoryBytes = 0;
    for (const vmi of running) {
      const cpu = (
        (vmi?.spec as Record<string, unknown> | undefined)?.['domain'] as
          | Record<string, unknown>
          | undefined
      )?.['cpu'];
      const sockets = (cpu as Record<string, unknown> | undefined)?.sockets ?? 1;
      const cores = (cpu as Record<string, unknown> | undefined)?.cores ?? 1;
      vcpu += Number(sockets) * Number(cores);
      const mem = (
        (vmi?.spec as Record<string, unknown> | undefined)?.['domain'] as
          | Record<string, unknown>
          | undefined
      )?.['memory'] as Record<string, unknown> | undefined;
      const guest = mem?.['guest'];
      let guestStr: string | undefined;
      if (typeof guest === 'string') {
        guestStr = guest;
      } else if (guest != null) {
        guestStr = String(guest);
      }
      memoryBytes += this.parseQuantityToBytes(guestStr);
    }
    const memoryMiB = memoryBytes / 1024 / 1024;

    const dvs = (await this.ctx.listCustomResources(
      'cdi.kubevirt.io',
      'v1beta1',
      namespace,
      'datavolumes',
    )) as KubernetesResource[];
    let storageBytes = 0;
    for (const dv of dvs) {
      const dvSpec = dv.spec as Record<string, unknown> | undefined;
      const pvc = dvSpec?.['pvc'] as Record<string, unknown> | undefined;
      const resources = pvc?.['resources'] as Record<string, unknown> | undefined;
      const requests = resources?.['requests'] as Record<string, unknown> | undefined;
      const req = requests?.['storage'];
      let reqStr: string | undefined;
      if (typeof req === 'string') {
        reqStr = req;
      } else if (req != null) {
        reqStr = String(req);
      }
      storageBytes += this.parseQuantityToBytes(reqStr);
    }
    const storageGiB = storageBytes / 1024 / 1024 / 1024;

    return {
      runningCount: running.length,
      vcpu,
      memoryMiB,
      storageGiB,
    };
  }

  async getPods(namespace: string) {
    try {
      const response = await this.ctx.coreV1Api.listNamespacedPod({ namespace });
      return response.items || [];
    } catch (error: unknown) {
      throw new Error(`Failed to get pods in namespace ${namespace}: ${getErrorMessage(error)}`);
    }
  }

  async listMigrationPolicies() {
    return await this.ctx.listClusterCustomResources(
      'migrations.kubevirt.io',
      'v1alpha1',
      'migrationpolicies',
    );
  }

  async migrationPolicyExists(policyName: string): Promise<boolean> {
    try {
      await this.ctx.getClusterCustomResource(
        'migrations.kubevirt.io',
        'v1alpha1',
        'migrationpolicies',
        policyName,
      );
      return true;
    } catch (error: unknown) {
      const msg = getErrorMessage(error);
      if (msg.includes('404') || msg.includes('not found')) {
        return false;
      }
      throw error;
    }
  }

  parseQuantityToBytes(q: string | undefined): number {
    if (!q || typeof q !== 'string') return 0;
    const s = q.trim();
    const match = s.match(/^(\d+(?:\.\d+)?)\s*([KMGTPE]i?)?$/);
    if (!match) return 0;
    const num = parseFloat(match[1]);
    const unit = (match[2] || '').toLowerCase();
    if (unit === 'ki') return num * 1024;
    if (unit === 'mi') return num * 1024 * 1024;
    if (unit === 'gi') return num * 1024 * 1024 * 1024;
    if (unit === 'ti') return num * 1024 * 1024 * 1024 * 1024;
    if (unit === 'k') return num * 1000;
    if (unit === 'm') return num * 1000 * 1000;
    if (unit === 'g') return num * 1000 * 1000 * 1000;
    return num;
  }

  async serviceExists(name: string, namespace: string): Promise<boolean> {
    try {
      const api = this.ctx.coreV1Api as unknown as {
        readNamespacedService: (p: { name: string; namespace: string }) => Promise<unknown>;
      };
      await api.readNamespacedService({ name, namespace });
      return true;
    } catch (error: unknown) {
      const msg = getErrorMessage(error);
      const statusCode =
        typeof error === 'object' && error !== null && 'statusCode' in error
          ? (error as { statusCode?: number }).statusCode
          : undefined;
      const responseStatus =
        typeof error === 'object' && error !== null && 'response' in error
          ? (error as { response?: { status?: number } }).response?.status
          : undefined;
      if (
        statusCode === 404 ||
        responseStatus === 404 ||
        msg.includes('404') ||
        msg.includes('not found')
      ) {
        return false;
      }
      throw error;
    }
  }

  async verifyMigrationPolicyCreated(
    policyName: string,
    timeoutMs = 30000,
  ): Promise<{
    error?: string;
    exists: boolean;
    policy?: KubernetesResource;
  }> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
      try {
        const policy = await this.getMigrationPolicy(policyName);

        return {
          exists: true,
          policy: policy,
        };
      } catch (error: unknown) {
        const msg = getErrorMessage(error);
        if (msg.includes('404') || msg.includes('not found')) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          continue;
        }
        return {
          error: msg,
          exists: false,
        };
      }
    }

    return {
      error: `Timeout after ${timeoutMs}ms waiting for MigrationPolicy ${policyName} to be created`,
      exists: false,
    };
  }

  async waitForPodReady(namespace: string, podName: string, timeoutMs = 60000): Promise<boolean> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
      try {
        const response = await this.ctx.coreV1Api.readNamespacedPod({ name: podName, namespace });
        const pod = response;

        if (
          pod.status?.phase === 'Running' &&
          pod.status?.conditions?.some((c) => c.type === 'Ready' && c.status === 'True')
        ) {
          return true;
        }
      } catch {
        //
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    return false;
  }

  async waitForServiceExists(
    name: string,
    namespace: string,
    timeoutMs: number = TestTimeouts.VM_BOOTUP,
    pollIntervalMs: number = TestTimeouts.POLLING_INTERVAL,
  ): Promise<boolean> {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      if (await this.serviceExists(name, namespace)) {
        return true;
      }
      await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
    }
    return false;
  }
}
