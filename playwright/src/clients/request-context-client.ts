import type {
  JsonPatchOp,
  KubernetesListResource,
  KubernetesResource,
} from '@/data-models/kubernetes-types';
import type { APIRequestContext, APIResponse, Page } from '@playwright/test';

import type { ClusterAuthConfig } from './base-client';
import BaseClient from './base-client';
import type { ProxyApiContext } from './proxy-handlers';
import {
  CdiProxyHandler,
  CoreProxyHandler,
  InfraProxyHandler,
  InstanceTypeProxyHandler,
  SnapshotProxyHandler,
  TemplateProxyHandler,
  VirtualMachineProxyHandler,
} from './proxy-handlers';

function isPage(p: Page | APIRequestContext): p is Page {
  return typeof (p as Page).goto === 'function';
}

/**
 * Client for interacting with the OpenShift console proxy API.
 *
 * Supports two authentication modes:
 *
 * **Browser-session mode** (pass a `Page`):
 *   - Shares cookies + CSRF token from the active browser context.
 *   - Use this inside E2E tests where a browser is already running.
 *
 * **Token mode** (pass an `APIRequestContext`):
 *   - Uses a Bearer token from `ClusterAuthConfig.token`.
 *   - No browser required — suitable for lightweight API-only tests.
 *   - Use this with Playwright's built-in `request` fixture.
 *
 * All requests target the console proxy path `/api/kubernetes/...` so the
 * same endpoint URLs work in both modes.
 *
 * Domain handlers are exposed as properties for concise access:
 *   - `apiClient.vm.*`         — VirtualMachines, VMIs, Migrations
 *   - `apiClient.snapshot.*`   — Snapshots, Restores, VolumeSnapshots
 *   - `apiClient.template.*`   — OpenShift Templates
 *   - `apiClient.instanceType.*` — InstanceTypes & Preferences
 *   - `apiClient.cdi.*`        — DataVolumes, DataSources, etc.
 *   - `apiClient.infra.*`      — HCO, KubeVirt CR, MigrationPolicies, NADs
 *   - `apiClient.core.*`       — ConfigMaps, Pods, PVCs
 *
 * Flat methods (e.g. `apiClient.getVirtualMachines()`) are kept as one-line
 * delegates to the handlers so existing call sites continue to work.
 */
export default class RequestContextClient extends BaseClient implements ProxyApiContext {
  private readonly _httpContext: APIRequestContext;
  private readonly _token: string;

  // ---------------------------------------------------------------------------
  // Domain handlers
  // ---------------------------------------------------------------------------

  readonly cdi: CdiProxyHandler;
  readonly core: CoreProxyHandler;
  readonly infra: InfraProxyHandler;
  readonly instanceType: InstanceTypeProxyHandler;
  readonly snapshot: SnapshotProxyHandler;
  readonly template: TemplateProxyHandler;
  readonly vm: VirtualMachineProxyHandler;

  constructor(page: Page, config: ClusterAuthConfig);
  constructor(apiContext: APIRequestContext, config: ClusterAuthConfig);
  constructor(pageOrContext: Page | APIRequestContext, config: ClusterAuthConfig) {
    super(isPage(pageOrContext) ? pageOrContext : undefined, config);
    this._httpContext = isPage(pageOrContext) ? pageOrContext.request : pageOrContext;
    this._token = config.token ?? '';

    this.vm = new VirtualMachineProxyHandler(this);
    this.snapshot = new SnapshotProxyHandler(this);
    this.template = new TemplateProxyHandler(this);
    this.instanceType = new InstanceTypeProxyHandler(this);
    this.cdi = new CdiProxyHandler(this);
    this.infra = new InfraProxyHandler(this);
    this.core = new CoreProxyHandler(this);
  }

  // ---------------------------------------------------------------------------
  // Private transport helpers
  // ---------------------------------------------------------------------------

  private async _buildCookieAuthOptions(
    extra?: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    const page = this.page;
    if (!page) {
      throw new Error('_buildCookieAuthOptions called without a Page instance');
    }

    const cookies = await page.context().cookies();
    const csrfToken = cookies.find((c) => c.name === 'csrf-token')?.value ?? '';
    const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join('; ');
    const pageUrl = new URL(page.url());
    const origin = `${pageUrl.protocol}//${pageUrl.host}`;

    return {
      ...extra,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json;charset=UTF-8',
        Cookie: cookieHeader,
        Origin: origin,
        Referer: page.url(),
        'User-Agent': await page.evaluate(() => navigator.userAgent),
        'X-CSRFToken': csrfToken,
        ...((extra?.headers as Record<string, string> | undefined) ?? {}),
      },
      ignoreHTTPSErrors: true,
    };
  }

  private async _buildTokenAuthOptions(
    extra?: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    // The console proxy sets a csrf-token cookie on every response. APIRequestContext
    // stores it automatically, so after the first GET the cookie is present. For mutating
    // requests the proxy checks that X-CSRFToken matches the csrf-token cookie — read it
    // back from storageState() so write ops are accepted without a browser session.
    let csrfToken = '';
    try {
      const state = await this._httpContext.storageState();
      csrfToken = state.cookies.find((c) => c.name === 'csrf-token')?.value ?? '';
    } catch {
      // storageState unavailable — proceed without CSRF header (GET-only contexts)
    }

    return {
      ...extra,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json;charset=UTF-8',
        ...(this._token ? { Authorization: `Bearer ${this._token}` } : {}),
        ...(csrfToken ? { 'X-CSRFToken': csrfToken } : {}),
        ...((extra?.headers as Record<string, string> | undefined) ?? {}),
      },
      ignoreHTTPSErrors: true,
    };
  }

  private async _parseResponse(response: APIResponse): Promise<KubernetesResource | null> {
    const body = await response.text();
    if (!response.ok()) {
      throw new Error(`HTTP ${response.status()} ${response.statusText()} — ${body}`);
    }
    if (!body) return null;
    try {
      return JSON.parse(body) as KubernetesResource;
    } catch {
      throw new Error(`Non-JSON response: ${body}`);
    }
  }

  private buildConsoleApiUrl(path: string): string {
    const base = this.baseUrl.endsWith('/') ? this.baseUrl.slice(0, -1) : this.baseUrl;
    return `${base}/api${path}`;
  }

  private async buildRequestOptions(
    extra?: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    if (this.page) {
      return this._buildCookieAuthOptions(extra);
    }
    return this._buildTokenAuthOptions(extra);
  }

  // ---------------------------------------------------------------------------
  // ProxyApiContext implementation — shared transport used by all handlers
  // ---------------------------------------------------------------------------

  async _request(
    method: 'get' | 'post' | 'put' | 'patch' | 'delete',
    path: string,
    extra?: Record<string, unknown>,
  ): Promise<KubernetesResource | null> {
    const url = this.buildConsoleApiUrl(path);
    const opts = await this.buildRequestOptions(extra);
    const dispatcher = this._httpContext;

    const getOpts = opts as Parameters<APIRequestContext['get']>[1];
    const mutateOpts = opts as Parameters<APIRequestContext['post']>[1];

    let response: APIResponse;
    switch (method) {
      case 'get':
        response = await dispatcher.get(url, getOpts);
        break;
      case 'post':
        response = await dispatcher.post(url, mutateOpts);
        break;
      case 'put':
        response = await dispatcher.put(url, mutateOpts);
        break;
      case 'patch':
        response = await dispatcher.patch(url, mutateOpts);
        break;
      case 'delete':
        response = await dispatcher.delete(url, opts as Parameters<APIRequestContext['delete']>[1]);
        break;
      default: {
        const _: never = method;
        throw new Error(`Unsupported HTTP method: ${String(_)}`);
      }
    }
    return this._parseResponse(response);
  }

  async checkPluginHealth(): Promise<boolean> {
    const url = this.buildConsoleApiUrl(
      '/proxy/plugin/kubevirt-plugin/kubevirt-apiserver-proxy/health',
    );
    const opts = await this.buildRequestOptions();
    const response = await this._httpContext.get(url, opts);
    return response.ok();
  }

  configureUserSettings(
    username = 'kube-admin',
    namespace = 'openshift-cnv',
    favoriteBootableVolumes: string[] = ['fedora'],
    dontShowWelcomeModal = true,
  ) {
    return this.core.configureUserSettings(
      username,
      namespace,
      favoriteBootableVolumes,
      dontShowWelcomeModal,
    );
  }

  createDataSource(namespace: string, spec: KubernetesResource) {
    return this.cdi.createDataSource(namespace, spec);
  }

  createDataVolume(namespace: string, spec: KubernetesResource) {
    return this.cdi.createDataVolume(namespace, spec);
  }

  createMigrationPolicy(spec: KubernetesResource) {
    return this.infra.createMigrationPolicy(spec);
  }

  createMultiNsStorageMigrationPlan(spec: KubernetesResource, namespace: string) {
    return this.infra.createMultiNsStorageMigrationPlan(spec, namespace);
  }

  // ---------------------------------------------------------------------------
  // project.openshift.io — Project patch
  // (Uses a non-standard /k8s/cluster/... URL, not delegated to a handler)
  // ---------------------------------------------------------------------------

  async createResource(
    group: string,
    version: string,
    plural: string,
    spec: KubernetesResource,
    namespace?: string,
  ): Promise<KubernetesResource | null> {
    const apiSegment = group
      ? `/kubernetes/apis/${group}/${version}`
      : `/kubernetes/api/${version}`;
    const nsSegment = namespace ? `/namespaces/${namespace}` : '';
    return this._request('post', `${apiSegment}${nsSegment}/${plural}`, { data: spec });
  }

  // ---------------------------------------------------------------------------
  // Plugin health check
  // Uses a direct HTTP GET rather than _request because the health endpoint
  // returns a plain-text body (not JSON), so _parseResponse would throw.
  // ---------------------------------------------------------------------------

  createStorageMigrationPlan(spec: KubernetesResource, namespace: string) {
    return this.infra.createStorageMigrationPlan(spec, namespace);
  }

  createTemplate(namespace: string, spec: KubernetesResource) {
    return this.template.create(namespace, spec);
  }

  // ---------------------------------------------------------------------------
  // Backward-compat flat methods — delegate to domain handlers
  // New code should use apiClient.<handler>.<method>() directly.
  // ---------------------------------------------------------------------------

  createVirtualMachine(namespace: string, spec: KubernetesResource) {
    return this.vm.create(namespace, spec);
  }
  createVirtualMachineClusterInstanceType(spec: KubernetesResource) {
    return this.instanceType.createClusterInstanceType(spec);
  }
  createVirtualMachineInstanceMigration(namespace: string, spec: KubernetesResource) {
    return this.vm.createMigration(namespace, spec);
  }
  createVirtualMachineInstanceType(namespace: string, spec: KubernetesResource) {
    return this.instanceType.createInstanceType(namespace, spec);
  }
  createVirtualMachinePreference(namespace: string, spec: KubernetesResource) {
    return this.instanceType.createPreference(namespace, spec);
  }
  createVirtualMachineRestore(namespace: string, spec: KubernetesResource) {
    return this.snapshot.createRestore(namespace, spec);
  }
  createVirtualMachineSnapshot(namespace: string, spec: KubernetesResource) {
    return this.snapshot.create(namespace, spec);
  }
  deleteDataSource(namespace: string, name: string) {
    return this.cdi.deleteDataSource(namespace, name);
  }

  deleteDataVolume(namespace: string, name: string) {
    return this.cdi.deleteDataVolume(namespace, name);
  }
  deleteMigrationPolicy(name: string) {
    return this.infra.deleteMigrationPolicy(name);
  }
  deleteMultiNsStorageMigrationPlan(name: string, namespace: string) {
    return this.infra.deleteMultiNsStorageMigrationPlan(name, namespace);
  }

  async deleteResource(
    group: string,
    version: string,
    plural: string,
    name: string,
    namespace?: string,
  ): Promise<KubernetesResource | null> {
    const apiSegment = group
      ? `/kubernetes/apis/${group}/${version}`
      : `/kubernetes/api/${version}`;
    const nsSegment = namespace ? `/namespaces/${namespace}` : '';
    return this._request('delete', `${apiSegment}${nsSegment}/${plural}/${name}`);
  }
  deleteStorageMigrationPlan(name: string, namespace: string) {
    return this.infra.deleteStorageMigrationPlan(name, namespace);
  }
  deleteTemplate(namespace: string, name: string) {
    return this.template.delete(namespace, name);
  }
  deleteVirtualMachine(namespace: string, name: string) {
    return this.vm.delete(namespace, name);
  }

  deleteVirtualMachineClusterInstanceType(name: string) {
    return this.instanceType.deleteClusterInstanceType(name);
  }
  deleteVirtualMachineInstanceMigration(namespace: string, name: string) {
    return this.vm.deleteMigration(namespace, name);
  }
  deleteVirtualMachineInstanceType(namespace: string, name: string) {
    return this.instanceType.deleteInstanceType(namespace, name);
  }
  deleteVirtualMachinePreference(namespace: string, name: string) {
    return this.instanceType.deletePreference(namespace, name);
  }
  deleteVirtualMachineRestore(namespace: string, name: string) {
    return this.snapshot.deleteRestore(namespace, name);
  }
  deleteVirtualMachineSnapshot(namespace: string, name: string) {
    return this.snapshot.delete(namespace, name);
  }
  getCdiConfig() {
    return this.cdi.getCdiConfig();
  }
  // -- Core --
  getConfigMap(namespace: string, name: string) {
    return this.core.getConfigMap(namespace, name);
  }
  getDataImportCrons(namespace?: string) {
    return this.cdi.listDataImportCrons(namespace);
  }

  getDataSource(namespace: string, name: string) {
    return this.cdi.getDataSource(namespace, name);
  }
  getDataSources(namespace?: string, labelSelector?: string) {
    return this.cdi.listDataSources(namespace, labelSelector);
  }
  getDataVolume(namespace: string, name: string) {
    return this.cdi.getDataVolume(namespace, name);
  }
  // -- CDI --
  getDataVolumes(namespace?: string) {
    return this.cdi.listDataVolumes(namespace);
  }
  getHyperConverged(namespace = 'openshift-cnv', name = 'kubevirt-hyperconverged') {
    return this.infra.getHyperConverged(namespace, name);
  }

  // -- Infra --
  getHyperConvergeds(namespace = 'openshift-cnv') {
    return this.infra.listHyperConvergeds(namespace);
  }
  getKubeVirt(namespace = 'openshift-cnv', name = 'kubevirt-kubevirt-hyperconverged') {
    return this.infra.getKubeVirt(namespace, name);
  }
  getKubeVirtUiFeatures(namespace = 'openshift-cnv') {
    return this.core.getUiFeatures(namespace);
  }
  getKubeVirtUserSettings(namespace = 'openshift-cnv') {
    return this.core.getUserSettings(namespace);
  }
  getMigrationPolicies() {
    return this.infra.listMigrationPolicies();
  }
  getMultiNsStorageMigrationPlan(name: string, namespace: string) {
    return this.infra.getMultiNsStorageMigrationPlan(name, namespace);
  }
  getNamespacedStorageMigrationPlans(namespace: string) {
    return this.infra.listNamespacedStorageMigrationPlans(namespace);
  }
  getNetworkAttachmentDefinitions(namespace: string) {
    return this.infra.listNetworkAttachmentDefinitions(namespace);
  }
  getPersistentVolumeClaims(namespace: string) {
    return this.core.listPersistentVolumeClaims(namespace);
  }
  getPods(namespace: string) {
    return this.core.listPods(namespace);
  }

  async getResource(
    group: string,
    version: string,
    plural: string,
    name: string,
    namespace?: string,
  ): Promise<KubernetesResource | null> {
    const apiSegment = group
      ? `/kubernetes/apis/${group}/${version}`
      : `/kubernetes/api/${version}`;
    const nsSegment = namespace ? `/namespaces/${namespace}` : '';
    return this._request('get', `${apiSegment}${nsSegment}/${plural}/${name}`);
  }
  getStorageMigrationPlan(name: string, namespace: string) {
    return this.infra.getStorageMigrationPlan(name, namespace);
  }
  getStorageMigrationPlans(namespace?: string) {
    return this.infra.listStorageMigrationPlans(namespace);
  }
  getStorageProfiles() {
    return this.cdi.listStorageProfiles();
  }
  getTemplate(namespace: string, name: string) {
    return this.template.get(namespace, name);
  }
  // -- Templates --
  getTemplates(namespace?: string, labelSelector?: string) {
    return this.template.list(namespace, labelSelector);
  }
  getVirtualMachine(namespace: string, name: string) {
    return this.vm.get(namespace, name);
  }
  // -- Instance types & Preferences --
  getVirtualMachineClusterInstanceTypes() {
    return this.instanceType.listClusterInstanceTypes();
  }
  getVirtualMachineClusterPreferences() {
    return this.instanceType.listClusterPreferences();
  }
  getVirtualMachineInstance(namespace: string, name: string) {
    return this.vm.getInstance(namespace, name);
  }
  getVirtualMachineInstanceMigration(namespace: string, name: string) {
    return this.vm.getMigration(namespace, name);
  }
  // -- VirtualMachineInstanceMigrations --
  getVirtualMachineInstanceMigrations(namespace?: string, queryParams?: Record<string, string>) {
    return this.vm.listMigrations(namespace, queryParams);
  }
  // -- VMIs --
  getVirtualMachineInstances(namespace?: string, queryParams?: Record<string, string>) {
    return this.vm.listInstances(namespace, queryParams);
  }

  getVirtualMachineInstanceTypes(namespace: string) {
    return this.instanceType.listInstanceTypes(namespace);
  }
  getVirtualMachinePreferences(namespace: string) {
    return this.instanceType.listPreferences(namespace);
  }
  getVirtualMachineRestore(namespace: string, name: string) {
    return this.snapshot.getRestore(namespace, name);
  }
  getVirtualMachineRestores(namespace: string) {
    return this.snapshot.listRestores(namespace);
  }
  // -- VMs --
  getVirtualMachines(namespace?: string, queryParams?: Record<string, string>) {
    return this.vm.list(namespace, queryParams);
  }
  getVirtualMachineSnapshot(namespace: string, name: string) {
    return this.snapshot.get(namespace, name);
  }
  // -- Snapshots --
  getVirtualMachineSnapshots(namespace: string) {
    return this.snapshot.list(namespace);
  }
  getVolumeSnapshots(namespace: string) {
    return this.snapshot.listVolumeSnapshots(namespace);
  }
  async listResources(
    group: string,
    version: string,
    plural: string,
    namespace?: string,
    queryParams?: Record<string, string>,
  ): Promise<KubernetesListResource> {
    const apiSegment = group
      ? `/kubernetes/apis/${group}/${version}`
      : `/kubernetes/api/${version}`;
    const nsSegment = namespace ? `/namespaces/${namespace}` : '';
    const qs = queryParams ? '?' + new URLSearchParams(queryParams).toString() : '';
    return (await this._request(
      'get',
      `${apiSegment}${nsSegment}/${plural}${qs}`,
    )) as unknown as KubernetesListResource;
  }
  /**
   * JSON Merge Patch (RFC 7396) any resource through the console proxy.
   * Prefer over `patchResource` when the target sub-path may not exist yet —
   * merge-patch creates missing intermediate objects automatically.
   * Required for CRDs (strategic-merge-patch is not supported).
   */
  async mergePatchResource(
    group: string,
    version: string,
    plural: string,
    name: string,
    patch: Record<string, unknown>,
    namespace?: string,
  ): Promise<KubernetesResource | null> {
    const apiSegment = group
      ? `/kubernetes/apis/${group}/${version}`
      : `/kubernetes/api/${version}`;
    const nsSegment = namespace ? `/namespaces/${namespace}` : '';
    return this._request('patch', `${apiSegment}${nsSegment}/${plural}/${name}`, {
      data: patch,
      headers: { 'Content-Type': 'application/merge-patch+json' },
    });
  }
  patchConfigMap(name: string, namespace: string, patchPayload: JsonPatchOp[]) {
    return this.core.patchConfigMap(name, namespace, patchPayload);
  }
  patchDataSource(namespace: string, name: string, patch: JsonPatchOp[]) {
    return this.cdi.patchDataSource(namespace, name, patch);
  }
  patchDataVolume(namespace: string, name: string, patch: JsonPatchOp[]) {
    return this.cdi.patchDataVolume(namespace, name, patch);
  }
  patchHyperConverged(
    namespace = 'openshift-cnv',
    name = 'kubevirt-hyperconverged',
    patchPayload: JsonPatchOp[],
  ) {
    return this.infra.patchHyperConverged(namespace, name, patchPayload);
  }
  patchMigrationPolicy(name: string, patch: JsonPatchOp[]) {
    return this.infra.patchMigrationPolicy(name, patch);
  }
  async patchProject(projectName: string, patchPayload: JsonPatchOp[]): Promise<void> {
    const base = this.baseUrl.endsWith('/') ? this.baseUrl.slice(0, -1) : this.baseUrl;
    const url = `${base}/k8s/cluster/project.openshift.io~v1~Project/${projectName}`;
    const opts = await this.buildRequestOptions({
      data: patchPayload,
      headers: { 'Content-Type': 'application/json-patch+json' },
    });
    const response = await this._httpContext.patch(url, opts);
    if (!response.ok()) {
      const body = await response.text().catch(() => '');
      throw new Error(`Failed to patch Project: ${response.status()} ${body}`);
    }
  }
  async patchResource(
    group: string,
    version: string,
    plural: string,
    name: string,
    patch: JsonPatchOp[],
    namespace?: string,
  ): Promise<KubernetesResource | null> {
    const apiSegment = group
      ? `/kubernetes/apis/${group}/${version}`
      : `/kubernetes/api/${version}`;
    const nsSegment = namespace ? `/namespaces/${namespace}` : '';
    return this._request('patch', `${apiSegment}${nsSegment}/${plural}/${name}`, {
      data: patch,
      headers: { 'Content-Type': 'application/json-patch+json' },
    });
  }
  patchTemplate(namespace: string, name: string, patch: JsonPatchOp[]) {
    return this.template.patch(namespace, name, patch);
  }

  patchVirtualMachine(namespace: string, name: string, patch: JsonPatchOp[]) {
    return this.vm.patch(namespace, name, patch);
  }
  /**
   * Prime the csrf-token cookie by fetching the console root page.
   * The OpenShift console only sets the csrf-token cookie on HTML page responses (not API calls).
   * Must be called before any mutating API request in token-auth (browserless) mode.
   */
  async primeCsrfToken(): Promise<void> {
    const base = this.baseUrl.endsWith('/') ? this.baseUrl.slice(0, -1) : this.baseUrl;
    await this._httpContext
      .get(base + '/', {
        headers: {
          ...(this._token ? { Authorization: `Bearer ${this._token}` } : {}),
        },
        ignoreHTTPSErrors: true,
      })
      .catch(() => undefined);
  }
  resetVirtualMachineInstance(namespace: string, vmName: string) {
    return this.vm.resetInstance(namespace, vmName);
  }
  restartVirtualMachine(namespace: string, name: string) {
    return this.vm.restart(namespace, name);
  }
  setConfirmVmActions(enabled: string, namespace = 'openshift-cnv') {
    return this.core.setConfirmVmActions(enabled, namespace);
  }
  setConsoleGuidedTourCompleted(
    completed: boolean,
    username = 'kubeadmin',
    namespace = 'openshift-console-user-settings',
  ) {
    return this.core.setConsoleGuidedTourCompleted(completed, username, namespace);
  }
  setMemoryDensity(
    memoryOvercommitPercentage: number,
    namespace = 'openshift-cnv',
    name = 'kubevirt-hyperconverged',
  ) {
    return this.infra.setMemoryDensity(memoryOvercommitPercentage, namespace, name);
  }
  startVirtualMachine(namespace: string, name: string) {
    return this.vm.start(namespace, name);
  }
  stopVirtualMachine(namespace: string, name: string) {
    return this.vm.stop(namespace, name);
  }
}
