import { existsSync } from 'fs';

import * as k8s from '@kubernetes/client-node';

import {
  createProxyAgent,
  generateKubeconfig,
  getOAuthToken,
  getProxyUrl,
} from './kubernetes-auth';
import { buildContainerDiskVmResource } from './vm-resources';

const POLL_INTERVAL = 2000;

/** Kubernetes client for scenario E2E tests. */
export class KubernetesClient {
  static readonly generateKubeconfig = generateKubeconfig;
  static readonly getOAuthToken = getOAuthToken;

  private readonly coApi: k8s.CustomObjectsApi;
  private readonly coreApi: k8s.CoreV1Api;
  private readonly kubeConfig: k8s.KubeConfig;

  constructor(kubeConfigPath: string) {
    this.kubeConfig = new k8s.KubeConfig();
    if (!existsSync(kubeConfigPath)) {
      throw new Error(`Kubeconfig not found: ${kubeConfigPath}`);
    }
    this.kubeConfig.loadFromFile(kubeConfigPath);

    const proxyUrl = getProxyUrl();
    const origCreateAgent = (
      this.kubeConfig as unknown as {
        createAgent: (c: unknown, o: Record<string, unknown>) => unknown;
      }
    ).createAgent.bind(this.kubeConfig);

    let sharedAgent: unknown = null;
    (
      this.kubeConfig as unknown as {
        createAgent: (c: unknown, o: unknown) => unknown;
      }
    ).createAgent = (cluster: unknown, agentOptions: unknown): unknown => {
      if (!sharedAgent) {
        const baseOpts =
          typeof agentOptions === 'object' && agentOptions !== null
            ? (agentOptions as Record<string, unknown>)
            : {};
        sharedAgent = proxyUrl
          ? createProxyAgent(proxyUrl)
          : origCreateAgent(cluster, {
              ...baseOpts,
              ALPNProtocols: ['http/1.1'],
              keepAlive: true,
              keepAliveMsecs: 30000,
            });
      }
      return sharedAgent;
    };

    this.coreApi = this.kubeConfig.makeApiClient(k8s.CoreV1Api);
    this.coApi = this.kubeConfig.makeApiClient(k8s.CustomObjectsApi);
  }

  private async waitForNamespaceActive(name: string, timeoutMs = 30_000): Promise<void> {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      try {
        const ns = await this.coreApi.readNamespace({ name });
        if (ns?.status?.phase === 'Active') return;
      } catch {
        // Not ready yet
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    throw new Error(`Timeout: Namespace ${name} did not become Active in ${timeoutMs}ms`);
  }

  async cleanupTestNamespace(name: string): Promise<void> {
    try {
      await this.coreApi.deleteNamespace({ name });
    } catch {
      /* Ignore — namespace may already be gone */
    }
  }

  async createContainerDiskVm(vmName: string, namespace: string): Promise<void> {
    try {
      await this.coApi.createNamespacedCustomObject({
        body: buildContainerDiskVmResource(vmName, namespace),
        group: 'kubevirt.io',
        namespace,
        plural: 'virtualmachines',
        version: 'v1',
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      if (msg.includes('409') || msg.includes('AlreadyExists')) return;
      throw error;
    }
  }

  getCurrentUserToken(): string | undefined {
    try {
      return this.kubeConfig.getCurrentUser()?.token;
    } catch {
      return undefined;
    }
  }

  async setupTestNamespace(name: string): Promise<void> {
    try {
      const existing = await this.coreApi.readNamespace({ name }).catch(() => null);
      if (existing) {
        await this.waitForNamespaceActive(name);
        return;
      }
    } catch {
      /* Namespace doesn't exist — create it */
    }
    await this.coreApi.createNamespace({
      body: {
        apiVersion: 'v1',
        kind: 'Namespace',
        metadata: { labels: { 'e2e-test': 'true', 'test-framework': 'playwright' }, name },
      },
    });
    await this.waitForNamespaceActive(name);
  }

  async verifyAuthentication(): Promise<boolean> {
    await this.coreApi.listNamespace({ limit: 1 });
    return true;
  }

  async waitForVmRunning(vmName: string, namespace: string, timeoutMs = 300_000): Promise<void> {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      try {
        const vm = (await this.coApi.getNamespacedCustomObject({
          group: 'kubevirt.io',
          name: vmName,
          namespace,
          plural: 'virtualmachines',
          version: 'v1',
        })) as Record<string, unknown>;
        const status = vm.status as { printableStatus?: string } | undefined;
        if (status?.printableStatus === 'Running') return;
      } catch {
        // VM may not exist yet — keep polling
      }
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
    }
    throw new Error(`Timeout: VM ${vmName} did not reach Running in ${timeoutMs}ms`);
  }
}
