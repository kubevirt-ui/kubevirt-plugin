/**
 * Spec-Level Resource Setup
 *
 * Provides API-level resource creation for test files, designed to be used
 * in `test.beforeAll()` to create shared resources once per spec file.
 *
 * Uses the KubernetesClient singleton directly (no browser/page needed),
 * making it suitable for worker-scoped or beforeAll setup.
 *
 * Resource data (names, namespaces) is automatically pushed into the
 * ScenarioContextManager on creation. Use `activate(key)` in `beforeEach`
 * to switch which resource is the "current" context target, so step drivers
 * can read from context without the spec file passing explicit parameters.
 *
 * @example
 * ```typescript
 * import { SpecResourceSetup } from '@/fixtures/spec-resource-setup';
 *
 * const res = new SpecResourceSetup();
 *
 * test.beforeAll(async () => {
 *   await res.createNamespace('vm-overview');
 *   await res.createVmFromTemplate('running-vm', {
 *     templateName: 'rhel9-server-small',
 *     running: true,
 *   });
 * });
 *
 * test.afterAll(async () => {
 *   await res.cleanup();
 * });
 *
 * test.beforeEach(() => {
 *   res.activate('running-vm'); // pushes VM name/namespace into context
 * });
 *
 * test('validate overview tab', async ({ steps }) => {
 *   // step drivers read CURRENT_VM_NAME / CURRENT_VM_NAMESPACE from context
 *   await steps.virtualMachineDetail.navigateToVmDetail();
 *   const valid = await steps.virtualMachineDetail.verifyOverviewCard();
 *   expect.soft(valid).toBe(true);
 * });
 * ```
 */

import type KubernetesClient from '@/clients/kubernetes-client';
import { getKubernetesClient } from '@/clients/kubernetes-client-singleton';
import { ContextKey } from '@/context-managers/context-keys';
import ScenarioContextManager from '@/context-managers/scenario-context-manager';
import { ensureApiAuth } from '@/utils/auth-healer';
import { EnvVariables } from '@/utils/env-variables';
import { logger } from '@/utils/logger';
import { generateRandomString } from '@/utils/random-data-generator';
import { TEMPLATE_METADATA_NAMES } from '@/utils/template-constants';
import { TestConfigManager, TestTimeouts } from '@/utils/test-config';

/**
 * Preferred order for template resolution when the caller has no preference.
 * Fedora first, then RHEL (latest → oldest), then CentOS Stream.
 */
const DEFAULT_TEMPLATE_PREFERENCE = [
  TEMPLATE_METADATA_NAMES.FEDORA,
  TEMPLATE_METADATA_NAMES.RHEL9,
  TEMPLATE_METADATA_NAMES.RHEL8,
  TEMPLATE_METADATA_NAMES.CENTOSSTREAM9,
  TEMPLATE_METADATA_NAMES.CENTOSSTREAM8,
  TEMPLATE_METADATA_NAMES.CENTOS7,
  TEMPLATE_METADATA_NAMES.RHEL7,
] as const;

export interface VmFromTemplateConfig {
  templateName: string;
  running?: boolean;
  templateProvider?: string;
  startAfterCreation?: boolean;
  waitReady?: boolean;
  waitTimeout?: number;
  namespace?: string;
  folderName?: string;
  cloudInitConfig?: { username?: string; password?: string };
  vmCustomization?: {
    description?: string;
    cpu?: number;
    memory?: number;
    bootMode?: 'BIOS' | 'UEFI' | 'UEFI (secure)';
    workload?: string;
    hostname?: string;
    headless?: boolean;
  };
  storageClassName?: string;
  sysprepConfigMapName?: string;
}

export interface VmFromInstanceTypeConfig {
  volumeName: string;
  running?: boolean;
  series?: string;
  instanceTypeSize?: string;
  namespace?: string;
  volumeNamespace?: string;
  storageClassName?: string;
  waitReady?: boolean;
  waitTimeout?: number;
}

export interface ResourceRef {
  name: string;
  namespace: string;
  type:
    | 'VirtualMachine'
    | 'Namespace'
    | 'Template'
    | 'DataVolume'
    | 'Secret'
    | 'ConfigMap'
    | 'MigrationPolicy'
    | 'VirtualMachineSnapshot'
    | 'ClusterInstanceType';
}

export class SpecResourceSetup {
  private _cleaned = false;
  private _client: KubernetesClient | null = null;
  private defaultNamespace: string;
  private namespacesToCleanup: string[] = [];

  private resources = new Map<string, ResourceRef>();

  constructor(defaultNamespace?: string) {
    const testConfig = TestConfigManager.getConfig();
    this.defaultNamespace =
      defaultNamespace || testConfig.testNamespace || EnvVariables.testNamespace;
  }

  private get client(): KubernetesClient {
    if (!this._client) {
      this._client = getKubernetesClient();
    }
    if (!this._client) {
      throw new Error('KubernetesClient not available — auth token missing');
    }
    return this._client;
  }

  private get ctx(): ScenarioContextManager {
    return ScenarioContextManager.getInstance();
  }

  private async deleteByType(
    client: KubernetesClient,
    refs: ResourceRef[],
    type: ResourceRef['type'],
    deleteFn: (ref: ResourceRef) => Promise<void>,
  ): Promise<void> {
    for (const ref of refs.filter((r) => r.type === type)) {
      try {
        await deleteFn(ref);
      } catch (e: unknown) {
        if (!this.isNotFound(e)) {
          console.warn(`[SpecResourceSetup] Failed to delete ${type} ${ref.name}: ${e}`);
        }
      }
    }
  }

  private isNotFound(error: unknown): boolean {
    const msg = error instanceof Error ? error.message : String(error);
    return msg.includes('404') || msg.includes('not found') || msg.includes('Not Found');
  }

  // ---------------------------------------------------------------------------
  // Dynamic template discovery
  // ---------------------------------------------------------------------------

  /**
   * Push a ResourceRef into the appropriate ContextKey slots based on its type.
   */
  private pushToContext(ref: ResourceRef): void {
    switch (ref.type) {
      case 'VirtualMachine':
        this.ctx.set(ContextKey.CURRENT_VM_NAME, ref.name);
        this.ctx.set(ContextKey.CURRENT_VM_NAMESPACE, ref.namespace);
        this.ctx.set(ContextKey.NAMESPACE, ref.namespace);
        break;
      case 'Namespace':
        this.ctx.set(ContextKey.NAMESPACE, ref.namespace);
        break;
      case 'Template':
        this.ctx.set(ContextKey.CURRENT_TEMPLATE_NAME, ref.name);
        this.ctx.set(ContextKey.CURRENT_TEMPLATE_NAMESPACE, ref.namespace);
        this.ctx.set(ContextKey.NAMESPACE, ref.namespace);
        break;
      case 'DataVolume':
        this.ctx.set(ContextKey.CURRENT_DATA_VOLUME_NAME, ref.name);
        this.ctx.set(ContextKey.CURRENT_DATA_VOLUME_NAMESPACE, ref.namespace);
        this.ctx.set(ContextKey.NAMESPACE, ref.namespace);
        break;
      case 'MigrationPolicy':
        this.ctx.set(ContextKey.CURRENT_MIGRATION_POLICY_NAME, ref.name);
        break;
      case 'ClusterInstanceType':
        this.ctx.set(ContextKey.CURRENT_INSTANCE_TYPE_NAME, ref.name);
        this.ctx.set(ContextKey.CURRENT_INSTANCE_TYPE_IS_CLUSTER_SCOPED, true);
        break;
      default:
        break;
    }
  }

  private async waitForDeletion(
    client: KubernetesClient,
    apiGroup: string,
    apiVersion: string,
    namespace: string,
    plural: string,
    name: string,
    timeout: number,
  ): Promise<void> {
    const deadline = Date.now() + timeout;
    while (Date.now() < deadline) {
      try {
        await client.getCustomResource(apiGroup, apiVersion, namespace, plural, name);
        await new Promise((r) => setTimeout(r, TestTimeouts.RETRY_DELAY));
      } catch {
        return;
      }
    }
  }

  private async waitForNamespaceGone(
    client: KubernetesClient,
    name: string,
    timeout: number,
  ): Promise<void> {
    const deadline = Date.now() + timeout;
    while (Date.now() < deadline) {
      try {
        const nsResource = await client.getCoreV1Api().readNamespace({ name });
        const status = nsResource?.status as Record<string, unknown> | undefined;
        const phase = status?.phase;
        if (phase === 'Terminating') {
          await new Promise((r) => setTimeout(r, TestTimeouts.UI_DELAY_EXTRA));
          continue;
        }
        await new Promise((r) => setTimeout(r, TestTimeouts.RETRY_DELAY));
      } catch {
        return;
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Context Manager integration
  // ---------------------------------------------------------------------------

  /**
   * Push a resource's details into the ScenarioContextManager so that
   * step drivers can read them without the spec file passing explicit params.
   *
   * Call this in test.beforeEach() or at the start of each test() to set
   * which resource the "current" context points to.
   *
   * @example
   * ```typescript
   * test.beforeEach(() => { res.activate('running-vm'); });
   *
   * test('verify overview', async ({ steps }) => {
   *   // step driver reads CURRENT_VM_NAME / CURRENT_VM_NAMESPACE from context
   *   await steps.virtualMachineDetail.navigateToCurrentVmDetail();
   * });
   * ```
   */
  activate(key: string): void {
    const ref = this.get(key);
    this.pushToContext(ref);
  }

  /** All tracked resource entries */
  get all(): Map<string, ResourceRef> {
    return this.resources;
  }

  async cleanup(): Promise<void> {
    if (this._cleaned) return;
    this._cleaned = true;

    try {
      await ensureApiAuth();
    } catch {
      // best-effort: proceed with stale token
    }
    this._client = null;

    const client = getKubernetesClient();
    if (!client) return;

    const refs = Array.from(this.resources.values());

    // Phase 1: Snapshots (must be deleted before VMs)
    await this.deleteByType(client, refs, 'VirtualMachineSnapshot', async (ref) => {
      await client.deleteCustomResource(
        'snapshot.kubevirt.io',
        'v1beta1',
        ref.namespace,
        'virtualmachinesnapshots',
        ref.name,
      );
    });

    // Phase 2: VMs (disable delete-protection first, then delete and wait for removal)
    const vmRefs = refs.filter((r) => r.type === 'VirtualMachine');
    for (const ref of vmRefs) {
      try {
        await client.disableDeleteProtection(ref.name, ref.namespace);
        await new Promise((r) => setTimeout(r, TestTimeouts.UI_ANIMATION_DELAY));
      } catch {
        // protection may not be set
      }
      try {
        await client.deleteCustomResource(
          'kubevirt.io',
          'v1',
          ref.namespace,
          'virtualmachines',
          ref.name,
        );
      } catch (e: unknown) {
        if (!this.isNotFound(e)) {
          console.warn(`[SpecResourceSetup] Failed to delete VM ${ref.name}: ${e}`);
        }
      }
    }

    // Wait for VMs to be fully removed (prevents namespace finalizer deadlock)
    for (const ref of vmRefs) {
      await this.waitForDeletion(
        client,
        'kubevirt.io',
        'v1',
        ref.namespace,
        'virtualmachines',
        ref.name,
        TestTimeouts.ELEMENT_WAIT,
      );
    }

    // Phase 3: Templates
    await this.deleteByType(client, refs, 'Template', async (ref) => {
      await client.deleteCustomResource(
        'template.openshift.io',
        'v1',
        ref.namespace,
        'templates',
        ref.name,
      );
    });

    // Phase 4: DataVolumes
    await this.deleteByType(client, refs, 'DataVolume', async (ref) => {
      await client.deleteCustomResource(
        'cdi.kubevirt.io',
        'v1beta1',
        ref.namespace,
        'datavolumes',
        ref.name,
      );
    });

    // Phase 5: Cluster-scoped resources
    await this.deleteByType(client, refs, 'MigrationPolicy', async (ref) => {
      await client.deleteClusterCustomResource(
        'migrations.kubevirt.io',
        'v1alpha1',
        'migrationpolicies',
        ref.name,
      );
    });

    await this.deleteByType(client, refs, 'ClusterInstanceType', async (ref) => {
      await client.deleteClusterCustomResource(
        'instancetype.kubevirt.io',
        'v1beta1',
        'virtualmachineclusterinstancetypes',
        ref.name,
      );
    });

    // Phase 6: Secrets and ConfigMaps
    await this.deleteByType(client, refs, 'Secret', async (ref) => {
      await client.getCoreV1Api().deleteNamespacedSecret({
        name: ref.name,
        namespace: ref.namespace,
      });
    });

    await this.deleteByType(client, refs, 'ConfigMap', async (ref) => {
      await client.getCoreV1Api().deleteNamespacedConfigMap({
        name: ref.name,
        namespace: ref.namespace,
      });
    });

    // Phase 7: Namespaces (cascade-deletes remaining resources)
    for (const ns of this.namespacesToCleanup) {
      try {
        await client.getCoreV1Api().deleteNamespace({ name: ns });
      } catch (e: unknown) {
        if (!this.isNotFound(e)) {
          console.warn(`[SpecResourceSetup] Failed to delete namespace ${ns}: ${e}`);
        }
      }
    }

    // Wait for namespaces to be fully terminated
    for (const ns of this.namespacesToCleanup) {
      await this.waitForNamespaceGone(client, ns, TestTimeouts.LONG_OPERATION);
    }

    this.resources.clear();
    this.namespacesToCleanup = [];
  }

  async createNamespace(prefix: string): Promise<string> {
    const name = `pw-${prefix}-${generateRandomString(8, 'alphanumeric').toLowerCase()}`;
    const created = await this.client.createNamespace(name);
    if (!created) {
      throw new Error(`Failed to create namespace ${name}`);
    }
    await this.client.waitForNamespaceReady(name, TestTimeouts.DEFAULT);

    if (EnvVariables.isNonPrivUser) {
      try {
        await this.client.grantUserAccessToNamespace(name, EnvVariables.username);
      } catch {
        // best-effort
      }
    }

    this.defaultNamespace = name;
    this.namespacesToCleanup.push(name);
    const ref: ResourceRef = { name, namespace: name, type: 'Namespace' };
    this.resources.set(`ns:${prefix}`, ref);
    this.pushToContext(ref);
    return name;
  }

  async createTemplate(key: string, name: string, namespace?: string): Promise<ResourceRef> {
    const ns = namespace || this.defaultNamespace;
    const templateResource = {
      apiVersion: 'template.openshift.io/v1',
      kind: 'Template',
      metadata: {
        name,
        namespace: ns,
        labels: {
          'template.kubevirt.io/type': 'base',
          'os.template.kubevirt.io/fedora': 'true',
          'workload.template.kubevirt.io/server': 'true',
        },
      },
      objects: [
        {
          apiVersion: 'kubevirt.io/v1',
          kind: 'VirtualMachine',
          metadata: {
            name: '${NAME}',
            labels: { app: '${NAME}' },
          },
          spec: {
            runStrategy: 'Always',
            template: {
              metadata: {
                labels: { 'kubevirt.io/domain': '${NAME}' },
              },
              spec: {
                domain: {
                  devices: {
                    disks: [{ disk: { bus: 'virtio' }, name: 'containerdisk' }],
                    interfaces: [{ masquerade: {}, model: 'virtio', name: 'default' }],
                    rng: {},
                  },
                  resources: { requests: { memory: '1Gi' } },
                },
                networks: [{ name: 'default', pod: {} }],
                terminationGracePeriodSeconds: 180,
                volumes: [
                  {
                    containerDisk: { image: 'quay.io/containerdisks/fedora:latest' },
                    name: 'containerdisk',
                  },
                ],
              },
            },
          },
        },
      ],
      parameters: [
        {
          description: 'VM name',
          from: 'vm-[a-z0-9]{6}',
          generate: 'expression',
          name: 'NAME',
        },
        {
          description: 'Password for the cloud-init user',
          from: '[a-z0-9]{4}-[a-z0-9]{4}',
          generate: 'expression',
          name: 'CLOUD_USER_PASSWORD',
        },
      ],
    };

    try {
      await this.client.createCustomResource(
        'template.openshift.io',
        'v1',
        ns,
        'templates',
        templateResource,
      );
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      if (!msg.includes('AlreadyExists')) throw error;
      // Template already exists (leftover from previous run) — reuse it
    }

    const ref: ResourceRef = { name, namespace: ns, type: 'Template' };
    this.resources.set(key, ref);
    this.pushToContext(ref);
    return ref;
  }

  async createVmFromTemplate(key: string, config: VmFromTemplateConfig): Promise<ResourceRef> {
    const ns = config.namespace || this.defaultNamespace;
    const vmName = `pw-${key}-${generateRandomString(6, 'alphanumeric').toLowerCase()}`;
    const running = config.running ?? true;
    const templateProvider = config.templateProvider || 'openshift';
    const startAfterCreation = config.startAfterCreation ?? running;

    await this.client.createVmFromTemplate(
      config.templateName,
      vmName,
      ns,
      templateProvider,
      startAfterCreation,
      config.sysprepConfigMapName,
      config.cloudInitConfig,
      config.vmCustomization,
      config.storageClassName,
      config.folderName,
    );

    const verified = await this.client.verifyVmCreated(
      vmName,
      ns,
      config.waitTimeout || TestTimeouts.VM_BOOTUP,
    );
    if (!verified.exists) {
      throw new Error(`VM '${vmName}' was not created in namespace '${ns}'`);
    }

    if (running && config.waitReady !== false) {
      await this.client.waitForVmRunning(vmName, ns, config.waitTimeout || TestTimeouts.VM_BOOTUP);

      // Populate STATE_VM_POD_NAME so tests relying on pod name context have it
      try {
        const pods = await this.client.getPods(ns);
        const vmPod = pods?.find((pod) =>
          pod.metadata?.ownerReferences?.some(
            (ref) => ref.kind === 'VirtualMachineInstance' && ref.name === vmName,
          ),
        );
        if (vmPod?.metadata?.name) {
          this.ctx.set(ContextKey.STATE_VM_POD_NAME, vmPod.metadata.name);
        }
      } catch {
        // best-effort
      }
    }

    const ref: ResourceRef = { name: vmName, namespace: ns, type: 'VirtualMachine' };
    this.resources.set(key, ref);
    this.pushToContext(ref);
    return ref;
  }

  // ---------------------------------------------------------------------------
  // Namespace
  // ---------------------------------------------------------------------------

  /**
   * Discover ALL templates in the cluster that have a ready boot source.
   * Returns template metadata names sorted by the default preference order
   * (Fedora > RHEL9 > RHEL8 > CentOS Stream 9 > ...).
   *
   * Templates not in the preference list are appended at the end.
   */
  async discoverAvailableTemplates(ns = 'openshift'): Promise<string[]> {
    try {
      const templates = await this.client.listTemplates(ns);
      if (!Array.isArray(templates) || templates.length === 0) return [];

      const available: string[] = [];

      for (const tpl of templates) {
        const name: string = tpl.metadata?.name;
        if (!name) continue;

        const labels = tpl.metadata?.labels || {};
        if (labels['template.kubevirt.io/type'] !== 'base') continue;

        const ref = this.client.getTemplateBootDataSourceRef(tpl);
        if (!ref) continue;

        try {
          if (await this.client.isDataSourceReady(ref.name, ref.namespace)) {
            available.push(name);
          }
        } catch {
          // boot source check failed — skip
        }
      }

      // Sort: preferred templates first, remainder alphabetical
      const preferenceIndex = new Map(DEFAULT_TEMPLATE_PREFERENCE.map((t, i) => [t, i]));
      available.sort((a, b) => {
        const ia = preferenceIndex.get(a) ?? Number.MAX_SAFE_INTEGER;
        const ib = preferenceIndex.get(b) ?? Number.MAX_SAFE_INTEGER;
        return ia !== ib ? ia - ib : a.localeCompare(b);
      });

      logger.info(
        `[SpecResourceSetup] Discovered ${
          available.length
        } template(s) with ready boot source: ${available.join(', ')}`,
      );
      return available;
    } catch (error) {
      logger.warn(`[SpecResourceSetup] Failed to discover templates: ${error}`);
      return [];
    }
  }

  // ---------------------------------------------------------------------------
  // VirtualMachine from template
  // ---------------------------------------------------------------------------

  /**
   * Verify API auth is still valid; refresh token if expired.
   * Call at the top of test.beforeAll() for long-running suites.
   */
  async ensureAuth(): Promise<void> {
    await ensureApiAuth();
    this._client = null; // force re-acquire from refreshed singleton
  }

  // ---------------------------------------------------------------------------
  // Template
  // ---------------------------------------------------------------------------

  /**
   * Retrieve a previously created resource by key.
   * @throws if the key doesn't exist
   */
  get(key: string): ResourceRef {
    const ref = this.resources.get(key);
    if (!ref) {
      throw new Error(
        `SpecResourceSetup: resource '${key}' not found. Available: [${[
          ...this.resources.keys(),
        ].join(', ')}]`,
      );
    }
    return ref;
  }

  // ---------------------------------------------------------------------------
  // Generic resource tracking (for resources created elsewhere)
  // ---------------------------------------------------------------------------

  has(key: string): boolean {
    return this.resources.has(key);
  }

  get namespace(): string {
    return this.defaultNamespace;
  }

  /**
   * Resolve the best available template that has a ready boot source.
   * Queries the cluster dynamically — no hardcoded candidate list required.
   *
   * @returns The preferred template name, or null if none is available.
   */
  async resolvePreferredTemplate(ns = 'openshift'): Promise<string | null> {
    const available = await this.discoverAvailableTemplates(ns);
    return available.length > 0 ? available[0] : null;
  }

  /**
   * Resolve the best available template (existence only, boot source not required).
   * Useful for tests that override the disk source.
   */
  async resolvePreferredTemplateByExistence(ns = 'openshift'): Promise<string | null> {
    for (const name of DEFAULT_TEMPLATE_PREFERENCE) {
      try {
        await this.client.getTemplate(name, ns);
        return name;
      } catch {
        // not found — try next
      }
    }
    return null;
  }

  /**
   * Discover the first template from `candidates` that exists in the cluster.
   * Does NOT require a ready boot source — use for tests that override the
   * disk source (URL, PVC, Upload, Registry).
   */
  async resolveTemplate(candidates: readonly string[], ns = 'openshift'): Promise<string | null> {
    for (const name of candidates) {
      try {
        await this.client.getTemplate(name, ns);
        return name;
      } catch {
        // template doesn't exist — try next
      }
    }
    return null;
  }

  // ---------------------------------------------------------------------------
  // Cleanup
  // ---------------------------------------------------------------------------

  /**
   * Discover the first template from `candidates` that exists AND has a ready
   * boot source (DataSource). Use for tests that create VMs with the default
   * boot source (no disk source override).
   */
  async resolveTemplateWithBootSource(
    candidates: readonly string[],
    ns = 'openshift',
  ): Promise<string | null> {
    for (const name of candidates) {
      try {
        const tpl = await this.client.getTemplate(name, ns);
        const ref = this.client.getTemplateBootDataSourceRef(tpl);
        if (ref && (await this.client.isDataSourceReady(ref.name, ref.namespace))) {
          return name;
        }
      } catch {
        // template doesn't exist or boot source not ready — try next
      }
    }
    return null;
  }

  track(key: string, ref: ResourceRef): void {
    this.resources.set(key, ref);
  }

  trackClusterInstanceType(key: string, name: string): void {
    this.resources.set(key, {
      name,
      namespace: '',
      type: 'ClusterInstanceType',
    });
  }

  trackNamespace(name: string): void {
    if (!this.namespacesToCleanup.includes(name)) {
      this.namespacesToCleanup.push(name);
    }
    this.resources.set(`ns:${name}`, { name, namespace: name, type: 'Namespace' });
  }

  trackSnapshot(key: string, name: string, namespace?: string): void {
    this.resources.set(key, {
      name,
      namespace: namespace || this.defaultNamespace,
      type: 'VirtualMachineSnapshot',
    });
  }

  trackVm(key: string, name: string, namespace?: string): void {
    this.resources.set(key, {
      name,
      namespace: namespace || this.defaultNamespace,
      type: 'VirtualMachine',
    });
  }
}
