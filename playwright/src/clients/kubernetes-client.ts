import * as fs from 'fs';

import * as k8s from '@kubernetes/client-node';

import {
  createProxyAgent,
  generateInClusterKubeconfig,
  generateKubeconfig,
  getOAuthToken,
  getProxyUrl,
  isInClusterEnvironment,
} from './kubernetes-auth';

const POLL_INTERVAL = 2000;

/**
 * Kubernetes client for scenario E2E tests.
 * Wraps @kubernetes/client-node directly — extend with new methods as tests require them.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type K8sResource = Record<string, any>;

export class KubernetesClient {
  static readonly generateInClusterKubeconfig = generateInClusterKubeconfig;
  static readonly generateKubeconfig = generateKubeconfig;
  static readonly getOAuthToken = getOAuthToken;
  static readonly isInClusterEnvironment = isInClusterEnvironment;

  private readonly coApi: k8s.CustomObjectsApi;
  private readonly coreApi: k8s.CoreV1Api;
  private readonly kc: k8s.KubeConfig;
  private rbacApi?: k8s.RbacAuthorizationV1Api;

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

  async deleteClusterCustomResource(
    group: string,
    version: string,
    plural: string,
    name: string,
  ): Promise<void> {
    await this.coApi.deleteClusterCustomObject({ group, version, plural, name });
  }

  async deleteCustomResource(
    group: string,
    version: string,
    namespace: string,
    plural: string,
    name: string,
  ): Promise<void> {
    await this.coApi.deleteNamespacedCustomObject({ group, version, namespace, plural, name });
  }

  async disableNativeVmTemplateFeatureGate(
    name = 'kubevirt-hyperconverged',
    namespace = 'openshift-cnv',
  ): Promise<void> {
    await this.patchHyperConverged(name, namespace, [
      { op: 'remove', path: '/spec/featureGates/withHostPassthroughCPU' },
    ]);
  }

  // ── Public API accessors ─────────────────────────────────────────────

  async disableVirtualizationWelcomeSettings(
    cnvNamespace: string,
    username: string,
    _userUid?: string,
  ): Promise<boolean> {
    try {
      const cmName = `kubevirt-ui-settings-${username}`;
      await this.patchConfigMap(cmName, cnvNamespace, {
        quickStart: JSON.stringify({ dontShowWelcomeModal: true }),
      });
      return true;
    } catch {
      return false;
    }
  }

  async enableNativeVmTemplateFeatureGate(
    name = 'kubevirt-hyperconverged',
    namespace = 'openshift-cnv',
  ): Promise<void> {
    await this.patchHyperConverged(name, namespace, [
      { op: 'add', path: '/spec/featureGates', value: { withHostPassthroughCPU: true } },
    ]);
  }

  // ── Generic custom resource operations ──────────────────────────────

  async ensureNonPrivUserExists(username: string, password: string): Promise<boolean> {
    try {
      const secret = await this.coreApi.readNamespacedSecret({
        name: 'htpass-secret',
        namespace: 'openshift-config',
      });
      const currentData = secret?.data?.htpasswd
        ? Buffer.from(secret.data.htpasswd, 'base64').toString('utf-8')
        : '';

      if (currentData.includes(`${username}:`)) {
        return false;
      }

      const { execSync } = await import('child_process');
      const hash = execSync(`htpasswd -nbB "${username}" "${password}"`, {
        encoding: 'utf8',
        timeout: 10_000,
      }).trim();

      const updated = currentData.endsWith('\n')
        ? `${currentData}${hash}\n`
        : `${currentData}\n${hash}\n`;

      await this.coreApi.patchNamespacedSecret({
        name: 'htpass-secret',
        namespace: 'openshift-config',
        body: { data: { htpasswd: Buffer.from(updated).toString('base64') } },
      });
      return true;
    } catch {
      return false;
    }
  }

  async ensureVmFoldersEnabled(cnvNamespace: string): Promise<K8sResource | null> {
    try {
      await this.patchConfigMap('kubevirt-ui-features', cnvNamespace, {
        treeViewFolders: 'true',
      });
      return { data: { treeViewFolders: 'true' } };
    } catch {
      return null;
    }
  }

  getCoreV1Api(): k8s.CoreV1Api {
    return this.coreApi;
  }

  getCurrentUserToken(): string | undefined {
    try {
      return this.kc.getCurrentUser()?.token;
    } catch {
      return undefined;
    }
  }

  // ── VM operations ───────────────────────────────────────────────────

  async getHyperConverged(
    name = 'kubevirt-hyperconverged',
    namespace = 'openshift-cnv',
  ): Promise<K8sResource> {
    return (await this.coApi.getNamespacedCustomObject({
      group: 'hco.kubevirt.io',
      version: 'v1beta1',
      namespace,
      plural: 'hyperconvergeds',
      name,
    })) as K8sResource;
  }

  // ── HyperConverged operations ───────────────────────────────────────

  getRbacApi(): k8s.RbacAuthorizationV1Api {
    if (!this.rbacApi) {
      this.rbacApi = this.kc.makeApiClient(k8s.RbacAuthorizationV1Api);
    }
    return this.rbacApi;
  }

  async getUserUid(username: string): Promise<string | undefined> {
    try {
      const result = await this.coApi.getClusterCustomObject({
        group: 'user.openshift.io',
        version: 'v1',
        plural: 'users',
        name: username,
      });
      return (result as K8sResource)?.metadata?.uid;
    } catch {
      return undefined;
    }
  }

  async grantUserCdiClusterReadAccess(username: string): Promise<void> {
    const rbac = this.getRbacApi();
    const name = `${username}-cdi-cluster-read`;
    try {
      await rbac.createClusterRoleBinding({
        body: {
          metadata: { name },
          roleRef: {
            apiGroup: 'rbac.authorization.k8s.io',
            kind: 'ClusterRole',
            name: 'cdi.kubevirt.io:config-reader',
          },
          subjects: [{ apiGroup: 'rbac.authorization.k8s.io', kind: 'User', name: username }],
        },
      });
    } catch (e: unknown) {
      const msg = (e as Error).message || '';
      if (!msg.includes('409') && !msg.includes('AlreadyExists')) throw e;
    }
  }

  async grantUserClusterViewAccess(username: string): Promise<void> {
    const rbac = this.getRbacApi();
    const name = `${username}-cluster-view`;
    try {
      await rbac.createClusterRoleBinding({
        body: {
          metadata: { name },
          roleRef: {
            apiGroup: 'rbac.authorization.k8s.io',
            kind: 'ClusterRole',
            name: 'cluster-reader',
          },
          subjects: [{ apiGroup: 'rbac.authorization.k8s.io', kind: 'User', name: username }],
        },
      });
    } catch (e: unknown) {
      const msg = (e as Error).message || '';
      if (!msg.includes('409') && !msg.includes('AlreadyExists')) throw e;
    }
  }

  async grantUserKubevirtAccessToNamespace(namespace: string, username: string): Promise<void> {
    const rbac = this.getRbacApi();
    const bindingName = `${username}-kubevirt-${namespace}`;
    try {
      await rbac.createNamespacedRoleBinding({
        namespace,
        body: {
          metadata: { name: bindingName, namespace },
          roleRef: { apiGroup: 'rbac.authorization.k8s.io', kind: 'ClusterRole', name: 'admin' },
          subjects: [{ apiGroup: 'rbac.authorization.k8s.io', kind: 'User', name: username }],
        },
      });
    } catch (e: unknown) {
      const msg = (e as Error).message || '';
      if (!msg.includes('409') && !msg.includes('AlreadyExists')) throw e;
    }
  }

  // ── ConfigMap operations ────────────────────────────────────────────

  async grantUserViewAccessToNamespace(namespace: string, username: string): Promise<void> {
    const rbac = this.getRbacApi();
    const bindingName = `${username}-view-${namespace}`;
    try {
      await rbac.createNamespacedRoleBinding({
        namespace,
        body: {
          metadata: { name: bindingName, namespace },
          roleRef: { apiGroup: 'rbac.authorization.k8s.io', kind: 'ClusterRole', name: 'view' },
          subjects: [{ apiGroup: 'rbac.authorization.k8s.io', kind: 'User', name: username }],
        },
      });
    } catch (e: unknown) {
      const msg = (e as Error).message || '';
      if (!msg.includes('409') && !msg.includes('AlreadyExists')) throw e;
    }
  }

  async isNativeVmTemplateFeatureGateEnabled(
    name = 'kubevirt-hyperconverged',
    namespace = 'openshift-cnv',
  ): Promise<boolean> {
    try {
      const hco = await this.getHyperConverged(name, namespace);
      const featureGates = (hco?.spec as K8sResource)?.featureGates as K8sResource | undefined;
      return featureGates?.withHostPassthroughCPU === true;
    } catch {
      return false;
    }
  }

  async listClusterCustomResources(
    group: string,
    version: string,
    plural: string,
  ): Promise<K8sResource[]> {
    const result = await this.coApi.listClusterCustomObject({ group, version, plural });
    return ((result as K8sResource).items as K8sResource[]) || [];
  }

  async listCustomResources(
    group: string,
    version: string,
    namespace: string,
    plural: string,
  ): Promise<K8sResource[]> {
    const result = await this.coApi.listNamespacedCustomObject({
      group,
      version,
      namespace,
      plural,
    });
    return ((result as K8sResource).items as K8sResource[]) || [];
  }

  async patchConfigMap(
    name: string,
    namespace: string,
    data: Record<string, string>,
  ): Promise<void> {
    await this.coreApi.patchNamespacedConfigMap({
      name,
      namespace,
      body: { data },
    });
  }

  // ── StorageClass operations ─────────────────────────────────────────

  async patchHyperConverged(
    name: string,
    namespace: string,
    patchOps: Array<{ op: string; path: string; value?: unknown }>,
  ): Promise<void> {
    await this.coApi.patchNamespacedCustomObject({
      group: 'hco.kubevirt.io',
      version: 'v1beta1',
      namespace,
      plural: 'hyperconvergeds',
      name,
      body: patchOps,
    });
  }

  // ── Non-priv user operations ────────────────────────────────────────

  async removeVmDeleteProtection(vmName: string, namespace: string): Promise<void> {
    await this.coApi.patchNamespacedCustomObject({
      group: 'kubevirt.io',
      version: 'v1',
      namespace,
      plural: 'virtualmachines',
      name: vmName,
      body: [{ op: 'remove', path: '/metadata/labels/kubevirt.io~1vm-delete-protection' }],
    });
  }

  // ── RBAC operations ─────────────────────────────────────────────────

  async setDefaultStorageClassForVirtualMachines(storageClassName: string): Promise<void> {
    const storageApi = this.kc.makeApiClient(k8s.StorageV1Api);
    await storageApi.patchStorageClass({
      name: storageClassName,
      body: {
        metadata: {
          annotations: {
            'storageclass.kubevirt.io/is-default-virt-class': 'true',
          },
        },
      },
    });
  }

  async setupConsoleUserSettings(
    username: string,
    _namespace?: string,
    _maxRetries = 5,
  ): Promise<boolean> {
    try {
      const settingsKey = username === 'kubeadmin' ? 'kube-admin' : username;
      const cmName = `user-settings-${settingsKey}`;
      const ns = 'openshift-console-user-settings';
      await this.patchConfigMap(cmName, ns, {
        [settingsKey]: JSON.stringify({ guidedTour: { status: 'complete' } }),
      });
      return true;
    } catch {
      return false;
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
