import * as fs from 'fs';

import * as k8s from '@kubernetes/client-node';

import {
  createProxyAgent,
  generateKubeconfig,
  getOAuthToken,
  getProxyUrl,
} from './kubernetes-auth';

const POLL_INTERVAL = 2000;

/**
 * Kubernetes client for scenario E2E tests.
 * Wraps @kubernetes/client-node directly — extend with new methods as tests require them.
 */
export class KubernetesClient {
  static readonly generateKubeconfig = generateKubeconfig;
  static readonly getOAuthToken = getOAuthToken;

  private readonly coApi: k8s.CustomObjectsApi;
  private readonly coreApi: k8s.CoreV1Api;
  private readonly kc: k8s.KubeConfig;

  constructor(kubeConfigPath: string) {
    this.kc = new k8s.KubeConfig();

    if (!fs.existsSync(kubeConfigPath)) {
      throw new Error(`Kubeconfig not found: ${kubeConfigPath}`);
    }

    this.kc.loadFromFile(kubeConfigPath);

    const proxyUrl = getProxyUrl();
    const origCreateAgent = (
      this.kc as unknown as {
        createAgent: (c: unknown, o: Record<string, unknown>) => unknown;
      }
    ).createAgent.bind(this.kc);

    let sharedAgent: unknown = null;
    (
      this.kc as unknown as {
        createAgent: (c: unknown, o: unknown) => unknown;
      }
    ).createAgent = (cluster: unknown, agentOptions: unknown) => {
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

    this.coreApi = this.kc.makeApiClient(k8s.CoreV1Api);
    this.coApi = this.kc.makeApiClient(k8s.CustomObjectsApi);
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
      await new Promise((r) => setTimeout(r, 1000));
    }
    throw new Error(`Timeout: Namespace ${name} did not become Active in ${timeoutMs}ms`);
  }

  async cleanupTestNamespace(name: string): Promise<void> {
    try {
      await this.coreApi.deleteNamespace({ name });
    } catch {
      // Ignore — namespace may already be gone
    }
  }

  async createContainerDiskVm(vmName: string, namespace: string): Promise<void> {
    const vmResource = {
      apiVersion: 'kubevirt.io/v1',
      kind: 'VirtualMachine',
      metadata: {
        name: vmName,
        namespace,
        labels: { app: vmName, 'test-framework': 'playwright' },
      },
      spec: {
        runStrategy: 'Always',
        template: {
          metadata: { labels: { 'kubevirt.io/domain': vmName } },
          spec: {
            domain: {
              cpu: { cores: 1, sockets: 1, threads: 1 },
              memory: { guest: '128Mi' },
              devices: {
                disks: [{ disk: { bus: 'virtio' }, name: 'containerdisk' }],
                rng: {},
              },
            },
            volumes: [
              {
                name: 'containerdisk',
                containerDisk: {
                  image: 'quay.io/kubevirt/cirros-container-disk-demo:latest',
                },
              },
            ],
          },
        },
      },
    };

    try {
      await this.coApi.createNamespacedCustomObject({
        group: 'kubevirt.io',
        version: 'v1',
        namespace,
        plural: 'virtualmachines',
        body: vmResource,
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      if (msg.includes('409') || msg.includes('AlreadyExists')) return;
      throw error;
    }
  }

  getCurrentUserToken(): string | undefined {
    try {
      return this.kc.getCurrentUser()?.token;
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
      // Namespace doesn't exist — create it
    }

    await this.coreApi.createNamespace({
      body: {
        apiVersion: 'v1',
        kind: 'Namespace',
        metadata: {
          name,
          labels: {
            'test-framework': 'playwright',
            'e2e-test': 'true',
          },
        },
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
        const vm = await this.coApi.getNamespacedCustomObject({
          group: 'kubevirt.io',
          version: 'v1',
          namespace,
          plural: 'virtualmachines',
          name: vmName,
        });
        const status = (vm as Record<string, unknown>).status as
          | { printableStatus?: string }
          | undefined;
        if (status?.printableStatus === 'Running') return;
      } catch {
        // VM may not exist yet — keep polling
      }
      await new Promise((r) => setTimeout(r, POLL_INTERVAL));
    }
    throw new Error(`Timeout: VM ${vmName} did not reach Running in ${timeoutMs}ms`);
  }
}
