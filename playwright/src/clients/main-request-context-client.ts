import fs from 'fs';
import os from 'os';
import path from 'path';

import yaml from 'js-yaml';

import {
  canRunOc,
  patchConsoleUserSettings,
  resolveKubeconfig,
  runOcCommand,
} from '@/utils/cluster-oc';
import {
  csrfTokenFromPlaywrightCookies,
  getConsoleKubernetesProxyHeaders,
} from '@/utils/console-kubernetes-proxy';
import { patchConsoleUserSettingsViaConsoleProxy } from '@/utils/console-user-settings';
import { EnvVariables } from '@/utils/env-variables';
import { KUBEVIRT_INSTANCETYPE_API_VERSION } from '@/utils/constants';
import { assertValidStorageClassName } from '@/utils/k8s-resource-names';
import {
  enableInstanceTypesDeveloperPreviewOnCluster,
  enableInstanceTypesDeveloperPreviewViaConsoleApi,
  getKubevirtUiFeatureViaConsoleProxy,
  AUTO_RESOURCE_LIMITS_FEATURE_GATE,
  INSTANCE_TYPE_ENABLED,
  KUBEVIRT_HYPERCONVERGED_NAME,
  patchKubevirtUiFeatureViaConsoleProxy,
} from '@/utils/kubevirt-ui-features';
import { patchKubevirtUserSettingsHideWelcomeViaConsoleProxy } from '@/utils/kubevirt-user-settings';
import {
  configMapManifest,
  dataSourceManifest,
  migratableVirtualMachineManifest,
  migrationPolicyManifest,
  migrationPolicyMinimalManifest,
  networkAttachmentDefinitionManifest,
  openshiftTemplateManifest,
  persistentVolumeClaimManifest,
  virtualMachineClusterPreferenceManifest,
  virtualMachineInstancetypeManifest,
  virtualMachineManifest,
  virtualMachineSnapshotManifest,
} from '@/utils/manifests';
import { buildNativeVirtualMachineTemplateFromVm } from '@/utils/api-builders';
import type {
  JsonPatchOp,
  KubernetesListResource,
  KubernetesResource,
} from '@/data-models/kubernetes-types';
import { SSH_CONFIG } from '@/data-models/constants';
import {
  CdiProxyHandler,
  CoreProxyHandler,
  InfraProxyHandler,
  InstanceTypeProxyHandler,
  ProjectProxyHandler,
  SnapshotProxyHandler,
  TemplateProxyHandler,
  VirtualMachineProxyHandler,
  VmTemplateProxyHandler,
} from '@/clients/proxy-handlers';
import type { ProxyApiContext } from '@/clients/proxy-handlers/proxy-api-context';
import { pollUntil } from '@/utils/poll-until';
import { SECOND, TestTimeouts } from '@/utils/test-config';
import type { APIRequestContext } from '@playwright/test';

/** Resource kinds tracked for optional cleanup bookkeeping (main ScenarioContextManager parity). */
type TrackedResourceType = string;

const KIND_RESOLVE: Record<string, { group: string; version: string; plural: string }> = {
  configmap: { group: '', version: 'v1', plural: 'configmaps' },
  configmaps: { group: '', version: 'v1', plural: 'configmaps' },
  namespace: { group: '', version: 'v1', plural: 'namespaces' },
  namespaces: { group: '', version: 'v1', plural: 'namespaces' },
  secret: { group: '', version: 'v1', plural: 'secrets' },
  secrets: { group: '', version: 'v1', plural: 'secrets' },
  template: { group: 'template.openshift.io', version: 'v1', plural: 'templates' },
  templates: { group: 'template.openshift.io', version: 'v1', plural: 'templates' },
  virtualmachine: { group: 'kubevirt.io', version: 'v1', plural: 'virtualmachines' },
  virtualmachines: { group: 'kubevirt.io', version: 'v1', plural: 'virtualmachines' },
  virtualmachinesnapshot: {
    group: 'snapshot.kubevirt.io',
    version: 'v1alpha1',
    plural: 'virtualmachinesnapshots',
  },
  virtualmachinesnapshots: {
    group: 'snapshot.kubevirt.io',
    version: 'v1alpha1',
    plural: 'virtualmachinesnapshots',
  },
};

function resolveKind(kind: string): { group: string; version: string; plural: string } {
  const found = KIND_RESOLVE[kind.toLowerCase()];
  if (!found) {
    throw new Error(`Unsupported kind for getResourceByKind: ${kind}`);
  }
  return found;
}

interface K8sObject {
  apiVersion: string;
  kind: string;
  metadata?: {
    name?: string;
    namespace?: string;
  };
}

/** `oc delete` resource aliases (console proxy may return 403 while kubeconfig can still delete). */
const OC_DELETE_KIND: Record<string, string> = {
  Template: 'template',
  VirtualMachine: 'vm',
  VirtualMachineInstance: 'vmi',
  VirtualMachineTemplate: 'virtualmachinetemplate',
};

const KIND_PLURAL: Record<string, string> = {
  ConfigMap: 'configmaps',
  DataSource: 'datasources',
  MigrationPolicy: 'migrationpolicies',
  Namespace: 'namespaces',
  // Console bridge + OpenShift model use hyphenated plural (legacyPluralURL).
  NetworkAttachmentDefinition: 'network-attachment-definitions',
  PersistentVolumeClaim: 'persistentvolumeclaims',
  Secret: 'secrets',
  Template: 'templates',
  VirtualMachine: 'virtualmachines',
  VirtualMachineClusterPreference: 'virtualmachineclusterpreferences',
  VirtualMachineInstance: 'virtualmachineinstances',
  VirtualMachineInstanceMigration: 'virtualmachineinstancemigrations',
  VirtualMachineInstancetype: 'virtualmachineinstancetypes',
  VirtualMachineSnapshot: 'virtualmachinesnapshots',
  VirtualMachineTemplate: 'virtualmachinetemplates',
};

function parseApiVersion(apiVersion: string): { group: string; version: string } {
  if (!apiVersion.includes('/')) {
    return { group: '', version: apiVersion };
  }
  const [group, version] = apiVersion.split('/');
  return { group, version };
}

function resourceCollectionPath(doc: K8sObject): string {
  const { group, version } = parseApiVersion(doc.apiVersion);
  const plural = KIND_PLURAL[doc.kind];
  if (!plural) {
    throw new Error(`Unsupported kind for API path: ${doc.kind}`);
  }
  const ns = doc.metadata?.namespace;
  if (group) {
    const base = `/apis/${group}/${version}`;
    return ns ? `${base}/namespaces/${ns}/${plural}` : `${base}/${plural}`;
  }
  return ns ? `/api/${version}/namespaces/${ns}/${plural}` : `/api/${version}/${plural}`;
}

function resourceInstancePath(doc: K8sObject): string {
  const name = doc.metadata?.name;
  if (!name) {
    throw new Error(`Resource name is required for ${doc.kind}`);
  }
  return `${resourceCollectionPath(doc)}/${name}`;
}

/**
 * Client for the OpenShift console Kubernetes proxy (`/api/kubernetes/...`).
 *
 * Same class name and path as kubevirt-plugin `main`; this branch keeps a smaller method set
 * (flat helpers for scenario CRUD setup). Specs use it through the worker-scoped `apiClient`
 * fixture in `scenario-test-fixture.ts`.
 */
export default class RequestContextClient implements ProxyApiContext {
  private csrfToken?: string;
  private readonly trackedResources: Array<{
    type: TrackedResourceType;
    name: string;
    namespace?: string;
  }> = [];

  readonly cdi: CdiProxyHandler;
  readonly core: CoreProxyHandler;
  readonly infra: InfraProxyHandler;
  readonly instanceType: InstanceTypeProxyHandler;
  readonly project: ProjectProxyHandler;
  readonly snapshot: SnapshotProxyHandler;
  readonly template: TemplateProxyHandler;
  readonly vm: VirtualMachineProxyHandler;
  readonly vmTemplate: VmTemplateProxyHandler;

  constructor(private readonly request: APIRequestContext, private readonly consoleOrigin: string) {
    this.vm = new VirtualMachineProxyHandler(this);
    this.snapshot = new SnapshotProxyHandler(this);
    this.template = new TemplateProxyHandler(this);
    this.vmTemplate = new VmTemplateProxyHandler(this);
    this.instanceType = new InstanceTypeProxyHandler(this);
    this.cdi = new CdiProxyHandler(this);
    this.infra = new InfraProxyHandler(this);
    this.core = new CoreProxyHandler(this);
    this.project = new ProjectProxyHandler(this);
  }

  /**
   * Bookkeep a created resource for fixture cleanup (no-op until a cleanup fixture drains it).
   * Matches main `BaseClient.trackResource` call sites used by wizard helpers.
   */

  private async requireResource(
    resource: KubernetesResource | null,
    action: string,
  ): Promise<KubernetesResource> {
    if (!resource) {
      throw new Error(`${action} returned empty response`);
    }
    return resource;
  }

  trackResource(type: TrackedResourceType, name: string, namespace?: string): void {
    this.trackedResources.push({ type, name, namespace });
  }

  /** Keep X-CSRFToken aligned with this context's cookies (not stale on-disk storage state). */
  async refreshCsrfFromContext(): Promise<void> {
    const state = await this.request.storageState();
    this.csrfToken = csrfTokenFromPlaywrightCookies(state.cookies);
    if (!this.csrfToken) {
      throw new Error(
        'csrf-token cookie missing from API request context — re-run global setup or avoid parallel Playwright jobs sharing .storage-states/',
      );
    }
  }

  consoleProxyOptions(): { csrfToken?: string } {
    return { csrfToken: this.csrfToken };
  }

  private static describeLiveMigratable(
    conditions?: Array<{ message?: string; reason?: string; status?: string; type?: string }>,
  ): string {
    const condition = conditions?.find(({ type }) => type === 'LiveMigratable');
    if (!condition) {
      return 'LiveMigratable=<unset>';
    }
    const detail = [condition.reason, condition.message].filter(Boolean).join(': ');
    return `LiveMigratable=${condition.status}${detail ? ` (${detail})` : ''}`;
  }

  private applyResourceViaOc(doc: K8sObject): void {
    const kubeconfig = resolveKubeconfig();
    if (!kubeconfig) {
      throw new Error('kubeconfig required for oc apply fallback');
    }
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pw-k8s-'));
    const manifestPath = path.join(dir, 'manifest.yaml');
    fs.writeFileSync(manifestPath, yaml.dump(doc), 'utf8');
    try {
      runOcCommand(`oc apply -f "${manifestPath}"`, kubeconfig);
    } finally {
      fs.rmSync(dir, { force: true, recursive: true });
    }
  }

  private async expectOk(
    response: { ok: () => boolean; status: () => number; text: () => Promise<string> },
    action: string,
  ): Promise<void> {
    if (response.ok()) {
      return;
    }
    const body = await response.text();
    throw new Error(`${action} failed (${response.status()}): ${body.slice(0, 500)}`);
  }

  private isCsrfForbidden(status: number, body: string): boolean {
    return status === 403 && /CSRF/i.test(body);
  }

  private proxyHeaders(extra?: Record<string, string>): Record<string, string> {
    return {
      ...getConsoleKubernetesProxyHeaders(this.consoleOrigin, this.consoleProxyOptions()),
      ...extra,
    };
  }

  private ocDeleteResourceCommand(
    doc: Pick<K8sObject, 'kind'> & { metadata: { name: string; namespace?: string } },
  ): string {
    const name = doc.metadata.name;
    const ns = doc.metadata.namespace;
    const ocKind = OC_DELETE_KIND[doc.kind] ?? doc.kind.toLowerCase();
    const nsFlag = ns ? ` -n ${ns}` : '';
    return `oc delete ${ocKind} ${name}${nsFlag} --ignore-not-found --wait=false`;
  }

  private ocDeleteWhenProxyForbidden(
    doc: Pick<K8sObject, 'kind'> & { metadata: { name: string; namespace?: string } },
    status: number,
  ): boolean {
    if (!this.shouldOcFallbackOnProxyDelete(status) || !canRunOc()) {
      return false;
    }
    runOcCommand(this.ocDeleteResourceCommand(doc));
    return true;
  }

  private shouldOcFallbackOnProxyDelete(status: number): boolean {
    return status === 401 || status === 403;
  }

  private url(k8sPath: string): string {
    const origin = this.consoleOrigin.replace(/\/$/, '');
    const normalizedPath = k8sPath.startsWith('/') ? k8sPath : `/${k8sPath}`;
    return `${origin}/api/kubernetes${normalizedPath}`;
  }

  async applyBootableDataSourceExample(namespace: string, name = 'example'): Promise<void> {
    await this.applyYaml(
      dataSourceManifest({
        labels: { 'instancetype.kubevirt.io/default-preference': 'fedora' },
        name,
        namespace,
      }),
    );
  }

  async applyConfigMapExample(namespace: string, name = 'example-env'): Promise<void> {
    await this.applyYaml(configMapManifest({ name, namespace }));
  }

  async applyDataSourceExample(namespace: string, name = 'example'): Promise<void> {
    await this.applyYaml(dataSourceManifest({ name, namespace }));
  }

  async applyDataSourceWithAnnotations(
    namespace: string,
    name: string,
    annotations: Record<string, string>,
  ): Promise<void> {
    await this.applyYaml(dataSourceManifest({ annotations, name, namespace }));
  }

  async applyMigratableVirtualMachine(namespace: string, name: string): Promise<void> {
    await this.applyYaml(migratableVirtualMachineManifest({ name, namespace }));
  }

  async applyMigrationPolicyExample(name = 'example'): Promise<void> {
    await this.applyYaml(migrationPolicyManifest({ name }));
  }

  async applyMigrationPolicyMinimal(name: string): Promise<void> {
    await this.applyYaml(migrationPolicyMinimalManifest({ name }));
  }

  async applyNetworkAttachmentDefinition(namespace: string, name: string): Promise<void> {
    await this.applyYaml(networkAttachmentDefinitionManifest({ name, namespace }));
  }

  async applyOpenshiftTemplate(namespace: string, name = 'pw-template-e2e'): Promise<void> {
    await this.applyYaml(openshiftTemplateManifest({ name, namespace }));
  }

  async applyPersistentVolumeClaim(
    namespace: string,
    name: string,
    sizeGiB: number,
    storageClassName?: string,
  ): Promise<void> {
    const sc = storageClassName ? assertValidStorageClassName(storageClassName) : undefined;
    await this.applyYaml(
      persistentVolumeClaimManifest({ name, namespace, sizeGiB, storageClassName: sc }),
    );
  }

  async applyVirtualMachineClusterPreferenceExample(name = 'example'): Promise<void> {
    await this.applyYaml(virtualMachineClusterPreferenceManifest({ name }));
  }

  async applyVirtualMachineExample(namespace: string, name = 'example'): Promise<void> {
    await this.applyYaml(virtualMachineManifest({ name, namespace }));
  }

  /** Halted cirros VM — fast seed for VM detail → Save as template (no DataVolume provisioning). */
  async applyVirtualMachineForSaveAsTemplate(namespace: string, name: string): Promise<void> {
    await this.applyYaml(migratableVirtualMachineManifest({ name, namespace }));
  }

  /**
   * Ensures a stopped VM exists for save-as-template UI tests.
   * Does not wait for VMI; the action only needs the VirtualMachine CR.
   */
  async prepareVirtualMachineForSaveAsTemplate(namespace: string, name: string): Promise<void> {
    await this.deleteNativeVirtualMachineTemplate(name, namespace).catch(() => undefined);
    await this.deleteOpenshiftTemplate(name, namespace).catch(() => undefined);
    await this.deleteVirtualMachine(name, namespace).catch(() => undefined);
    await pollUntil(async () => !(await this.virtualMachineExists(name, namespace)), {
      message: `pre-setup: VM ${namespace}/${name} should be absent`,
      timeout: TestTimeouts.RESOURCE_CREATION,
    }).catch(() => undefined);
    await this.applyVirtualMachineForSaveAsTemplate(namespace, name);
    await pollUntil(() => this.virtualMachineExists(name, namespace), {
      message: `VM ${namespace}/${name} should exist for save-as-template`,
      timeout: TestTimeouts.RESOURCE_CREATION,
    });
  }

  /** Creates a native VirtualMachineTemplate from an existing VM (API parity with Save as template). */
  async applyNativeVirtualMachineTemplateFromVm(
    namespace: string,
    vmName: string,
    templateName: string,
    displayName?: string,
  ): Promise<void> {
    const vm = await this.getVirtualMachine(namespace, vmName);
    if (!vm) {
      throw new Error(`VirtualMachine ${namespace}/${vmName} not found`);
    }
    const doc = buildNativeVirtualMachineTemplateFromVm(
      { ...vm, metadata: { ...vm.metadata, name: vmName, namespace } },
      templateName,
      displayName,
    );
    await this.createOrReplace(doc);
  }

  async applyVirtualMachineSnapshot(
    namespace: string,
    vmName: string,
    snapshotName: string,
  ): Promise<void> {
    await this.applyYaml(virtualMachineSnapshotManifest({ name: snapshotName, namespace, vmName }));
  }

  async applyVirtualMachineInstancetypeExample(namespace: string, name = 'example'): Promise<void> {
    await this.applyYaml(virtualMachineInstancetypeManifest({ name, namespace }));
  }

  async applyYaml(manifestYaml: string): Promise<void> {
    const doc = yaml.load(manifestYaml) as K8sObject;
    await this.createOrReplace(doc);
  }

  async createOrReplace(doc: K8sObject): Promise<void> {
    const name = doc.metadata?.name;
    if (!name) {
      throw new Error(`metadata.name is required for ${doc.kind}`);
    }
    const getPath = this.url(resourceInstancePath(doc));
    const existing = await this.request.get(getPath, { headers: this.proxyHeaders() });
    if (existing.ok()) {
      const put = await this.request.put(getPath, {
        data: doc,
        headers: this.proxyHeaders({ 'Content-Type': 'application/json' }),
      });
      if (put.status() === 403 && canRunOc()) {
        this.applyResourceViaOc(doc);
        return;
      }
      await this.expectOk(put, `PUT ${doc.kind}/${name}`);
      return;
    }
    const post = await this.request.post(this.url(resourceCollectionPath(doc)), {
      data: doc,
      headers: this.proxyHeaders({ 'Content-Type': 'application/json' }),
    });
    if (post.status() === 409) {
      const put = await this.request.put(getPath, {
        data: doc,
        headers: this.proxyHeaders({ 'Content-Type': 'application/json' }),
      });
      if (put.status() === 403 && canRunOc()) {
        this.applyResourceViaOc(doc);
        return;
      }
      await this.expectOk(put, `PUT ${doc.kind}/${name} after conflict`);
      return;
    }
    if (post.status() === 403 && canRunOc()) {
      this.applyResourceViaOc(doc);
      return;
    }
    await this.expectOk(post, `POST ${doc.kind}/${name}`);
  }

  async dataSourceExists(name: string, namespace: string): Promise<boolean> {
    return this.resourceExists({
      apiVersion: 'cdi.kubevirt.io/v1beta1',
      kind: 'DataSource',
      metadata: { name, namespace },
    });
  }

  async deleteConfigMap(name: string, namespace: string): Promise<void> {
    await this.deleteResourceDocument({
      apiVersion: 'v1',
      kind: 'ConfigMap',
      metadata: { name, namespace },
    });
  }

  async deleteDataSource(name: string, namespace: string): Promise<KubernetesResource | null> {
    return this.cdi.deleteDataSource(namespace, name);
  }

  async deleteMigrationPolicy(name: string): Promise<KubernetesResource | null> {
    return this.infra.deleteMigrationPolicy(name);
  }

  async deleteNamespace(name: string): Promise<void> {
    const del = await this.request.delete(this.url(`/api/v1/namespaces/${name}`), {
      headers: this.proxyHeaders(),
    });
    const status = del.status();
    if (status === 404) {
      return;
    }
    if (del.ok() || status === 202) {
      return;
    }
    if (this.shouldOcFallbackOnProxyDelete(status) && canRunOc()) {
      runOcCommand(`oc delete namespace ${name} --wait=false --ignore-not-found`);
      return;
    }
    await this.expectOk(del, `delete Namespace/${name}`);
  }

  async deleteNetworkAttachmentDefinition(name: string, namespace: string): Promise<void> {
    await this.deleteResourceDocument({
      apiVersion: 'k8s.cni.cncf.io/v1',
      kind: 'NetworkAttachmentDefinition',
      metadata: { name, namespace },
    });
  }

  async deleteOpenshiftTemplate(name: string, namespace: string): Promise<void> {
    await this.deleteResourceDocument({
      apiVersion: 'template.openshift.io/v1',
      kind: 'Template',
      metadata: { name, namespace },
    });
  }

  async deleteNativeVirtualMachineTemplate(name: string, namespace: string): Promise<void> {
    await this.deleteResourceDocument({
      apiVersion: 'template.kubevirt.io/v1beta1',
      kind: 'VirtualMachineTemplate',
      metadata: { name, namespace },
    });
  }

  async deletePersistentVolumeClaim(name: string, namespace: string): Promise<void> {
    await this.deleteResourceDocument({
      apiVersion: 'v1',
      kind: 'PersistentVolumeClaim',
      metadata: { name, namespace },
    });
  }

  async deleteResourceDocument(
    doc: Pick<K8sObject, 'apiVersion' | 'kind'> & {
      metadata: { name: string; namespace?: string };
    },
  ): Promise<void> {
    const full: K8sObject = {
      apiVersion: doc.apiVersion,
      kind: doc.kind,
      metadata: doc.metadata,
    };
    const name = doc.metadata.name;
    for (let attempt = 0; attempt < 2; attempt++) {
      const del = await this.request.delete(this.url(resourceInstancePath(full)), {
        headers: this.proxyHeaders(),
      });
      const status = del.status();
      if (status === 404) {
        return;
      }
      if (del.ok() || status === 202) {
        return;
      }
      const body = await del.text().catch(() => '');
      if (attempt === 0 && this.isCsrfForbidden(status, body)) {
        await this.refreshCsrfFromContext();
        continue;
      }
      if (this.ocDeleteWhenProxyForbidden(doc, status)) {
        return;
      }
      await this.expectOk(del, `DELETE ${doc.kind}/${name}`);
    }
  }

  /** UI call sites use `(name, namespace)`. Returns proxy delete body for API assertions. */
  async deleteVirtualMachine(name: string, namespace: string): Promise<KubernetesResource | null> {
    const result = await this.vm.delete(namespace, name);
    await this.deleteResourceDocument({
      apiVersion: 'kubevirt.io/v1',
      kind: 'VirtualMachineInstance',
      metadata: { name, namespace },
    }).catch(() => undefined);
    return result;
  }

  async deleteVirtualMachineClusterPreference(name: string): Promise<void> {
    await this.deleteResourceDocument({
      apiVersion: KUBEVIRT_INSTANCETYPE_API_VERSION,
      kind: 'VirtualMachineClusterPreference',
      metadata: { name },
    });
  }

  async deleteVirtualMachineInstancetype(name: string, namespace: string): Promise<void> {
    await this.deleteResourceDocument({
      apiVersion: KUBEVIRT_INSTANCETYPE_API_VERSION,
      kind: 'VirtualMachineInstancetype',
      metadata: { name, namespace },
    });
  }

  async deleteVirtualMachineSnapshot(
    name: string,
    namespace: string,
  ): Promise<KubernetesResource | null> {
    return this.snapshot.delete(namespace, name);
  }

  async disableInstanceTypesDeveloperPreview(cnvNamespace?: string): Promise<void> {
    await patchKubevirtUiFeatureViaConsoleProxy(
      this.request,
      this.consoleOrigin,
      INSTANCE_TYPE_ENABLED,
      'false',
      cnvNamespace,
      this.consoleProxyOptions(),
    );
  }

  async enableInstanceTypesDeveloperPreview(cnvNamespace?: string): Promise<void> {
    if (EnvVariables.isNonPrivUser && canRunOc()) {
      await enableInstanceTypesDeveloperPreviewOnCluster({ cnvNamespace });
      return;
    }
    await enableInstanceTypesDeveloperPreviewViaConsoleApi(this.request, this.consoleOrigin, {
      cnvNamespace,
      ...this.consoleProxyOptions(),
    });
  }

  async ensureNamespace(name: string, nonPriv = false): Promise<void> {
    const get = await this.request.get(this.url(`/api/v1/namespaces/${name}`), {
      headers: this.proxyHeaders(),
    });
    if (!get.ok()) {
      const post = await this.request.post(this.url('/api/v1/namespaces'), {
        data: { apiVersion: 'v1', kind: 'Namespace', metadata: { name } },
        headers: this.proxyHeaders({ 'Content-Type': 'application/json' }),
      });
      if (post.status() === 403 && canRunOc()) {
        runOcCommand(`oc create namespace ${name}`);
      } else if (post.status() !== 409) {
        await this.expectOk(post, `create Namespace/${name}`);
      }
    }
    if (nonPriv && canRunOc()) {
      const kubeconfig = resolveKubeconfig();
      runOcCommand(`oc adm policy add-role-to-user admin test -n ${name}`, kubeconfig);
      await new Promise((resolve) => setTimeout(resolve, 2_000));
    }
  }

  async fetchDefaultStorageClassName(): Promise<string | undefined> {
    const res = await this.request.get(this.url('/apis/storage.k8s.io/v1/storageclasses'), {
      headers: this.proxyHeaders(),
    });
    if (!res.ok()) {
      return undefined;
    }
    const body = (await res.json()) as {
      items?: Array<{
        metadata?: { annotations?: Record<string, string>; name?: string };
      }>;
    };
    for (const item of body.items ?? []) {
      const annotations = item.metadata?.annotations ?? {};
      if (annotations['storageclass.kubernetes.io/is-default-class'] === 'true') {
        return item.metadata?.name;
      }
    }
    return body.items?.[0]?.metadata?.name;
  }

  /** `kubevirt-ui-features` in openshift-cnv — e.g. `instanceTypesEnabled` (developer preview). */
  async getKubevirtUiFeature(
    featureName: string,
    cnvNamespace?: string,
  ): Promise<string | undefined> {
    return getKubevirtUiFeatureViaConsoleProxy(
      this.request,
      this.consoleOrigin,
      featureName,
      cnvNamespace,
      this.consoleProxyOptions(),
    );
  }

  hyperConvergedApiPath(cnvNamespace = EnvVariables.cnvNamespace): string {
    return `/apis/hco.kubevirt.io/v1beta1/namespaces/${cnvNamespace}/hyperconvergeds/${KUBEVIRT_HYPERCONVERGED_NAME}`;
  }

  async getHyperConvergedAutoResourceLimits(
    cnvNamespace = EnvVariables.cnvNamespace,
  ): Promise<boolean | undefined> {
    const res = await this.request.get(this.url(this.hyperConvergedApiPath(cnvNamespace)), {
      headers: this.proxyHeaders(),
    });
    if (!res.ok()) {
      return undefined;
    }
    const body = (await res.json()) as { spec?: { featureGates?: Record<string, boolean> } };
    return body.spec?.featureGates?.[AUTO_RESOURCE_LIMITS_FEATURE_GATE];
  }

  async patchHyperConvergedAutoResourceLimits(
    enabled: boolean,
    cnvNamespace = EnvVariables.cnvNamespace,
  ): Promise<void> {
    const apiPath = this.hyperConvergedApiPath(cnvNamespace);
    const get = await this.request.get(this.url(apiPath), { headers: this.proxyHeaders() });
    await this.expectOk(get, `get HyperConverged/${KUBEVIRT_HYPERCONVERGED_NAME}`);
    const hco = (await get.json()) as { spec?: { featureGates?: Record<string, boolean> } };
    const gates = hco.spec?.featureGates;
    const patch =
      gates === undefined
        ? [
            {
              op: 'add',
              path: '/spec/featureGates',
              value: { [AUTO_RESOURCE_LIMITS_FEATURE_GATE]: enabled },
            },
          ]
        : gates[AUTO_RESOURCE_LIMITS_FEATURE_GATE] === undefined
        ? [
            {
              op: 'add',
              path: `/spec/featureGates/${AUTO_RESOURCE_LIMITS_FEATURE_GATE}`,
              value: enabled,
            },
          ]
        : [
            {
              op: 'replace',
              path: `/spec/featureGates/${AUTO_RESOURCE_LIMITS_FEATURE_GATE}`,
              value: enabled,
            },
          ];
    const patchRes = await this.request.patch(this.url(apiPath), {
      data: patch,
      headers: this.proxyHeaders({ 'Content-Type': 'application/json-patch+json' }),
    });
    await this.expectOk(patchRes, `patch HyperConverged autoResourceLimits=${enabled}`);
  }

  async getNamespace(
    name: string,
  ): Promise<{ labels?: Record<string, string>; name: string } | null> {
    const get = await this.request.get(this.url(`/api/v1/namespaces/${name}`), {
      headers: this.proxyHeaders(),
    });
    if (!get.ok()) {
      return null;
    }
    const body = (await get.json()) as {
      metadata?: { labels?: Record<string, string>; name?: string };
    };
    const nsName = body.metadata?.name;
    return nsName ? { labels: body.metadata?.labels, name: nsName } : null;
  }

  async getSchedulableNodeCount(): Promise<number> {
    const res = await this.request.get(this.url('/api/v1/nodes'), {
      headers: this.proxyHeaders(),
    });
    if (!res.ok()) {
      return 0;
    }
    const body = (await res.json()) as {
      items?: Array<{ spec?: { unschedulable?: boolean } }>;
    };
    return (body.items ?? []).filter((node) => !node.spec?.unschedulable).length;
  }

  async getVirtualMachine(namespace: string, name: string): Promise<KubernetesResource | null> {
    return this.vm.get(namespace, name);
  }

  async getVirtualMachineCloudInitUserData(namespace: string, name: string): Promise<string> {
    const vm = await this.getVirtualMachine(namespace, name);
    const volumes = (
      vm?.spec as
        | {
            template?: {
              spec?: {
                volumes?: Array<{ cloudInitNoCloud?: { userData?: string } }>;
              };
            };
          }
        | undefined
    )?.template?.spec?.volumes;
    const raw =
      volumes?.find((volume) => volume.cloudInitNoCloud)?.cloudInitNoCloud?.userData ?? '';
    if (!raw) {
      return '';
    }
    if (raw.includes('user:') || raw.includes('#cloud-config')) {
      return raw;
    }
    try {
      return Buffer.from(raw, 'base64').toString('utf8');
    } catch {
      return raw;
    }
  }

  async getVirtualMachineInstance(
    namespace: string,
    name: string,
  ): Promise<KubernetesResource | null> {
    return this.vm.getInstance(namespace, name);
  }

  async labelNamespace(name: string, key: string, value: string): Promise<void> {
    const patch = await this.request.patch(this.url(`/api/v1/namespaces/${name}`), {
      data: { metadata: { labels: { [key]: value } } },
      headers: this.proxyHeaders({ 'Content-Type': 'application/merge-patch+json' }),
    });
    await this.expectOk(patch, `label Namespace/${name}`);
  }

  async listPersistentVolumeClaimNames(namespace: string): Promise<string[]> {
    const get = await this.request.get(
      this.url(`/api/v1/namespaces/${encodeURIComponent(namespace)}/persistentvolumeclaims`),
      { headers: this.proxyHeaders() },
    );
    if (!get.ok()) {
      return [];
    }
    const body = (await get.json()) as { items?: Array<{ metadata?: { name?: string } }> };
    return (body.items ?? [])
      .map((item) => item.metadata?.name)
      .filter((name): name is string => Boolean(name));
  }

  async migrationPolicyExists(name: string): Promise<boolean> {
    return this.resourceExists({
      apiVersion: 'migrations.kubevirt.io/v1alpha1',
      kind: 'MigrationPolicy',
      metadata: { name },
    });
  }

  async openshiftTemplateExists(name: string, namespace: string): Promise<boolean> {
    return this.resourceExists({
      apiVersion: 'template.openshift.io/v1',
      kind: 'Template',
      metadata: { name, namespace },
    });
  }

  async nativeVirtualMachineTemplateExists(name: string, namespace: string): Promise<boolean> {
    return this.resourceExists({
      apiVersion: 'template.kubevirt.io/v1beta1',
      kind: 'VirtualMachineTemplate',
      metadata: { name, namespace },
    });
  }

  async getNativeVirtualMachineTemplate(namespace: string, name: string): Promise<unknown | null> {
    const res = await this.request.get(
      this.url(
        `/apis/template.kubevirt.io/v1beta1/namespaces/${namespace}/virtualmachinetemplates/${name}`,
      ),
      { headers: this.proxyHeaders() },
    );
    if (!res.ok()) {
      return null;
    }
    return res.json();
  }

  async waitForNativeVirtualMachineTemplate(
    name: string,
    namespace: string,
    timeoutMs = TestTimeouts.RESOURCE_CREATION,
  ): Promise<void> {
    await pollUntil(() => this.nativeVirtualMachineTemplateExists(name, namespace), {
      message: `Native VirtualMachineTemplate ${namespace}/${name} should exist`,
      timeout: timeoutMs,
    });
  }

  /**
   * Patch openshift-console-user-settings (welcome modals, catalog onboarding popover).
   * Does not select Template catalog vs InstanceTypes — that remains a UI step in VmWizardPage.
   */
  async patchConsoleUserSettings(settingsKey = 'kube-admin'): Promise<void> {
    if (EnvVariables.isNonPrivUser) {
      const kubeconfig = resolveKubeconfig();
      if (!kubeconfig) {
        throw new Error(
          'Non-priv tests require kubeadmin kubeconfig to patch console user-settings (oc)',
        );
      }
      patchConsoleUserSettings(kubeconfig, settingsKey);
      return;
    }
    await patchConsoleUserSettingsViaConsoleProxy(
      this.request,
      this.consoleOrigin,
      settingsKey,
      this.consoleProxyOptions(),
    );
  }

  async patchKubevirtUiFeature(
    featureName: string,
    value: string,
    cnvNamespace?: string,
  ): Promise<void> {
    await patchKubevirtUiFeatureViaConsoleProxy(
      this.request,
      this.consoleOrigin,
      featureName,
      value,
      cnvNamespace,
      this.consoleProxyOptions(),
    );
  }

  /** Hide virtualization welcome modal via `openshift-cnv/kubevirt-user-settings`. */
  async patchKubevirtUserSettingsHideWelcome(): Promise<void> {
    await patchKubevirtUserSettingsHideWelcomeViaConsoleProxy(
      this.request,
      this.consoleOrigin,
      this.consoleProxyOptions(),
    );
  }

  /** Env override (`E2E_STORAGE_CLASS` / `TEST_STORAGE_CLASS`) or cluster default StorageClass. */
  async resolveStorageClassName(): Promise<string | undefined> {
    const fromEnv = process.env.E2E_STORAGE_CLASS || process.env.TEST_STORAGE_CLASS;
    if (fromEnv?.trim()) {
      return assertValidStorageClassName(fromEnv);
    }
    const fromCluster = await this.fetchDefaultStorageClassName();
    return fromCluster ? assertValidStorageClassName(fromCluster) : undefined;
  }

  async resourceExists(
    doc: Pick<K8sObject, 'apiVersion' | 'kind'> & {
      metadata: { name: string; namespace?: string };
    },
  ): Promise<boolean> {
    const full: K8sObject = {
      apiVersion: doc.apiVersion,
      kind: doc.kind,
      metadata: doc.metadata,
    };
    try {
      const get = await this.request.get(this.url(resourceInstancePath(full)), {
        headers: this.proxyHeaders(),
        timeout: 20 * SECOND,
      });
      return get.ok();
    } catch {
      return false;
    }
  }

  async virtualMachineClusterPreferenceExists(name: string): Promise<boolean> {
    return this.resourceExists({
      apiVersion: KUBEVIRT_INSTANCETYPE_API_VERSION,
      kind: 'VirtualMachineClusterPreference',
      metadata: { name },
    });
  }

  async virtualMachineExists(name: string, namespace: string): Promise<boolean> {
    return this.resourceExists({
      apiVersion: 'kubevirt.io/v1',
      kind: 'VirtualMachine',
      metadata: { name, namespace },
    });
  }

  async virtualMachineInstancetypeExists(name: string, namespace: string): Promise<boolean> {
    return this.resourceExists({
      apiVersion: KUBEVIRT_INSTANCETYPE_API_VERSION,
      kind: 'VirtualMachineInstancetype',
      metadata: { name, namespace },
    });
  }

  async virtualMachineReferencesConfigMapVolume(
    namespace: string,
    vmName: string,
    configMapName: string,
  ): Promise<boolean> {
    const vm = await this.getVirtualMachine(namespace, vmName);
    const volumes =
      (
        vm?.spec as
          | {
              template?: {
                spec?: { volumes?: Array<{ configMap?: { name?: string } }> };
              };
            }
          | undefined
      )?.template?.spec?.volumes ?? [];
    return volumes.some((volume) => volume.configMap?.name === configMapName);
  }

  async virtualMachineSnapshotExists(name: string, namespace: string): Promise<boolean> {
    return this.resourceExists({
      apiVersion: 'snapshot.kubevirt.io/v1alpha1',
      kind: 'VirtualMachineSnapshot',
      metadata: { name, namespace },
    });
  }

  async waitForNetworkAttachmentDefinition(
    name: string,
    namespace: string,
    timeoutMs = TestTimeouts.ELEMENT_WAIT,
  ): Promise<void> {
    const doc: K8sObject = {
      apiVersion: 'k8s.cni.cncf.io/v1',
      kind: 'NetworkAttachmentDefinition',
      metadata: { name, namespace },
    };
    const instanceUrl = this.url(resourceInstancePath(doc));
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      const res = await this.request.get(instanceUrl, { headers: this.proxyHeaders() });
      if (res.ok()) {
        return;
      }
      await new Promise((r) => setTimeout(r, 500));
    }
    throw new Error(
      `Timed out waiting for NetworkAttachmentDefinition ${namespace}/${name} to exist`,
    );
  }

  async waitForPersistentVolumeClaimBound(
    name: string,
    namespace: string,
    timeoutMs = TestTimeouts.LONG_OPERATION,
  ): Promise<void> {
    const doc: K8sObject = {
      apiVersion: 'v1',
      kind: 'PersistentVolumeClaim',
      metadata: { name, namespace },
    };
    const pvcUrl = this.url(resourceInstancePath(doc));
    let lastPhase = 'unknown';
    await pollUntil(
      async () => {
        const res = await this.request.get(pvcUrl, { headers: this.proxyHeaders() });
        if (!res.ok()) {
          lastPhase = `GET ${res.status()}`;
          return false;
        }
        const body = (await res.json()) as { status?: { phase?: string } };
        lastPhase = body.status?.phase ?? 'missing';
        if (lastPhase === 'Bound') {
          return true;
        }
        if (lastPhase === 'Lost') {
          throw new Error(`PVC ${namespace}/${name} is Lost`);
        }
        return false;
      },
      {
        message: `PVC ${namespace}/${name} should reach Bound (last phase: ${lastPhase})`,
        timeout: timeoutMs,
      },
    );
  }

  /** @deprecated Prefer {@link waitForVmiMigrationComplete} */
  async waitForVmInstanceMigration(
    namespace: string,
    vmiName: string,
    timeoutSec = TestTimeouts.MIGRATION_COMPLETION / SECOND,
  ): Promise<void> {
    await this.waitForVmiMigrationComplete(namespace, vmiName, timeoutSec * 1000);
  }

  /** Console Actions → Start (`VMActionRequest` / subresource start). */
  async startVirtualMachine(namespace: string, name: string): Promise<void> {
    const subPath = `/apis/subresources.kubevirt.io/v1/namespaces/${namespace}/virtualmachines/${name}/start`;
    const start = await this.request.put(this.url(subPath), {
      data: {},
      headers: this.proxyHeaders({ 'Content-Type': 'application/json' }),
    });
    if (start.ok() || start.status() === 202) {
      return;
    }
    if (canRunOc()) {
      runOcCommand(
        `oc patch vm ${name} -n ${namespace} --type merge -p '{"spec":{"runStrategy":"Always"}}'`,
      );
      return;
    }
    await this.expectOk(start, `start VirtualMachine/${namespace}/${name}`);
  }

  /** Same VMIM create as Actions → Migration → Compute (console `migrateVM`). */
  async createLiveMigration(namespace: string, vmiName: string): Promise<void> {
    const suffix = `-mig-${Math.random().toString(36).slice(2, 6)}`;
    const base = vmiName.slice(0, 253 - suffix.length);
    await this.applyYaml(`apiVersion: kubevirt.io/v1
kind: VirtualMachineInstanceMigration
metadata:
  name: ${base}${suffix}
  namespace: ${namespace}
spec:
  vmiName: ${vmiName}`);
  }

  /** Matches console migrate action: Running VM, running VMI, no `LiveMigratable=False`. */
  async waitForVmReadyToMigrate(
    namespace: string,
    name: string,
    timeoutMs = TestTimeouts.MIGRATION_VM_READY,
  ): Promise<void> {
    const deadline = Date.now() + timeoutMs;
    let lastState = '';
    while (Date.now() < deadline) {
      const vm = await this.getVirtualMachine(namespace, name);
      const vmi = await this.getVirtualMachineInstance(namespace, name);
      const vmStatus = vm?.status as
        | {
            conditions?: Array<{
              message?: string;
              reason?: string;
              status?: string;
              type?: string;
            }>;
            printableStatus?: string;
          }
        | undefined;
      const vmiStatus = vmi?.status as { phase?: string } | undefined;
      const liveMigratable = vmStatus?.conditions?.find(
        ({ status, type }) => type === 'LiveMigratable' && status === 'True',
      );
      const vmRunning = vmStatus?.printableStatus === 'Running';
      const vmiRunning = !vmiStatus?.phase || vmiStatus.phase === 'Running';
      lastState = `printableStatus=${vmStatus?.printableStatus ?? 'n/a'} vmiPhase=${
        vmiStatus?.phase ?? 'n/a'
      } ${RequestContextClient.describeLiveMigratable(vmStatus?.conditions)}`;

      if (vmRunning && vmiRunning && liveMigratable) {
        return;
      }
      await new Promise((r) => setTimeout(r, 2000));
    }
    throw new Error(
      `Timed out waiting for VM ${namespace}/${name} to be migratable (${lastState})`,
    );
  }

  /**
   * Wait until live migration finished (VMIM Succeeded or VMI migrationState.completed).
   * Polls frequently so fast migrations are not missed after the VMIM object is removed.
   */
  async waitForVmiMigrationComplete(
    namespace: string,
    vmiName: string,
    timeoutMs = TestTimeouts.MIGRATION_COMPLETION,
  ): Promise<void> {
    const deadline = Date.now() + timeoutMs;
    const listUrl = this.url(
      `/apis/kubevirt.io/v1/namespaces/${namespace}/virtualmachineinstancemigrations`,
    );
    let sawMigration = false;

    while (Date.now() < deadline) {
      const res = await this.request.get(listUrl, { headers: this.proxyHeaders() });
      if (res.ok()) {
        const list = (await res.json()) as {
          items?: Array<{ spec?: { vmiName?: string }; status?: { phase?: string } }>;
        };
        const item = list.items?.find((m) => m.spec?.vmiName === vmiName);
        const phase = item?.status?.phase;
        if (phase === 'Failed') {
          throw new Error(`VirtualMachineInstanceMigration failed for ${vmiName}`);
        }
        if (phase === 'Running' || phase === 'Pending') {
          sawMigration = true;
        }
        if (phase === 'Succeeded') {
          return;
        }
      }

      const vmi = await this.getVirtualMachineInstance(namespace, vmiName);
      const vmiStatus = vmi?.status as
        | {
            migrationState?: { completed?: boolean; endTimestamp?: string };
            phase?: string;
          }
        | undefined;
      if (vmiStatus?.migrationState?.completed || vmiStatus?.migrationState?.endTimestamp) {
        return;
      }

      if (sawMigration && vmiStatus?.phase === 'Running') {
        return;
      }

      await new Promise((r) => setTimeout(r, 500));
    }
    throw new Error(`Timed out waiting for live migration to complete for VMI ${vmiName}`);
  }

  async listStorageClassNames(): Promise<string[]> {
    const res = await this.request.get(this.url('/apis/storage.k8s.io/v1/storageclasses'), {
      headers: this.proxyHeaders(),
    });
    if (!res.ok()) {
      return [];
    }
    const body = (await res.json()) as { items?: Array<{ metadata?: { name?: string } }> };
    return (body.items ?? [])
      .map((item) => item.metadata?.name)
      .filter((name): name is string => Boolean(name));
  }

  async getPersistentVolumeClaimStorageClass(
    namespace: string,
    name: string,
  ): Promise<string | undefined> {
    const res = await this.request.get(
      this.url(`/api/v1/namespaces/${namespace}/persistentvolumeclaims/${name}`),
      { headers: this.proxyHeaders() },
    );
    if (!res.ok()) {
      return undefined;
    }
    const body = (await res.json()) as { spec?: { storageClassName?: string } };
    return body.spec?.storageClassName;
  }

  async listNamespacedCustomResources(
    group: string,
    version: string,
    namespace: string,
    plural: string,
  ): Promise<Array<{ metadata?: { name?: string; deletionTimestamp?: string } }>> {
    const res = await this.request.get(
      this.url(`/apis/${group}/${version}/namespaces/${namespace}/${plural}`),
      { headers: this.proxyHeaders() },
    );
    if (!res.ok()) {
      return [];
    }
    const body = (await res.json()) as {
      items?: Array<{ metadata?: { name?: string; deletionTimestamp?: string } }>;
    };
    return body.items ?? [];
  }

  async deleteNamespacedCustomResource(
    group: string,
    version: string,
    namespace: string,
    plural: string,
    name: string,
  ): Promise<void> {
    const res = await this.request.delete(
      this.url(`/apis/${group}/${version}/namespaces/${namespace}/${plural}/${name}`),
      { headers: this.proxyHeaders() },
    );
    if (!res.ok() && res.status() !== 404) {
      await this.expectOk(res, `delete ${plural}/${namespace}/${name}`);
    }
  }

  async isClusterSingleNode(): Promise<boolean> {
    return (await this.getSchedulableNodeCount()) <= 1;
  }

  async getVirtualMachineInstanceNodeName(
    namespace: string,
    name: string,
  ): Promise<string | undefined> {
    const res = await this.request.get(
      this.url(`/apis/kubevirt.io/v1/namespaces/${namespace}/virtualmachineinstances/${name}`),
      { headers: this.proxyHeaders() },
    );
    if (!res.ok()) {
      return undefined;
    }
    const body = (await res.json()) as { status?: { nodeName?: string } };
    return body.status?.nodeName;
  }

  async listWorkerNodeNames(): Promise<string[]> {
    const res = await this.request.get(this.url('/api/v1/nodes'), {
      headers: this.proxyHeaders(),
    });
    if (!res.ok()) {
      return [];
    }
    const body = (await res.json()) as {
      items?: Array<{ metadata?: { name?: string }; spec?: { unschedulable?: boolean } }>;
    };
    return (body.items ?? [])
      .filter((node) => !node.spec?.unschedulable)
      .map((node) => node.metadata?.name)
      .filter((name): name is string => Boolean(name));
  }

  async cordonNode(nodeName: string): Promise<void> {
    if (!canRunOc()) {
      throw new Error('cordonNode requires oc (set SKIP_OC only for console-only lanes)');
    }
    runOcCommand(`oc adm cordon ${nodeName}`);
  }

  async uncordonNode(nodeName: string): Promise<void> {
    if (!canRunOc()) {
      throw new Error('uncordonNode requires oc');
    }
    runOcCommand(`oc adm uncordon ${nodeName}`);
  }

  async applyDataVolumeVirtualMachine(namespace: string, name: string): Promise<void> {
    await this.deleteVirtualMachine(name, namespace).catch(() => undefined);
    await this.applyYaml(virtualMachineManifest({ name, namespace }));
  }

  async waitForVirtualMachineRunning(
    namespace: string,
    name: string,
    timeoutMs = TestTimeouts.VM_BOOTUP,
  ): Promise<void> {
    await pollUntil(
      async () => {
        const vm = await this.getVirtualMachine(namespace, name);
        return vm?.status?.printableStatus === 'Running';
      },
      { message: `VM ${namespace}/${name} should reach Running`, timeout: timeoutMs },
    );
  }

  private apiCollectionPath(
    group: string,
    version: string,
    plural: string,
    namespace?: string,
  ): string {
    const apiSegment = group ? `/apis/${group}/${version}` : `/api/${version}`;
    const nsSegment = namespace ? `/namespaces/${namespace}` : '';
    return `${apiSegment}${nsSegment}/${plural}`;
  }

  /**
   * Raw console-proxy request. Handler paths include the `/kubernetes/...` prefix
   * (same contract as kubevirt-ui main `RequestContextClient._request`).
   *
   * Uses the same Origin/Referer/CSRF + JSON Content-Type headers as UI
   * `createOrReplace` — bare POSTs without Content-Type often get empty or 405
   * responses from the OpenShift console bridge on this branch.
   */
  async _request(
    method: 'get' | 'post' | 'put' | 'patch' | 'delete',
    path: string,
    extra?: Record<string, unknown>,
  ): Promise<KubernetesResource | null> {
    const origin = this.consoleOrigin.replace(/\/$/, '');
    const normalized = path.startsWith('/') ? path : `/${path}`;
    const url = `${origin}/api${normalized}`;

    const extraHeaders = (extra?.headers as Record<string, string> | undefined) ?? {};
    const isMutating = method !== 'get';
    const defaultContentType: Record<string, string> =
      isMutating && !extraHeaders['Content-Type'] ? { 'Content-Type': 'application/json' } : {};

    for (let attempt = 0; attempt < 2; attempt++) {
      const headers = this.proxyHeaders({
        Accept: 'application/json',
        ...defaultContentType,
        ...extraHeaders,
      });
      const rest = { ...(extra ?? {}) };
      delete rest.headers;
      const opts = { ...rest, headers };

      let response;
      switch (method) {
        case 'get':
          response = await this.request.get(url, opts as Parameters<APIRequestContext['get']>[1]);
          break;
        case 'post':
          response = await this.request.post(url, opts as Parameters<APIRequestContext['post']>[1]);
          break;
        case 'put':
          response = await this.request.put(url, opts as Parameters<APIRequestContext['put']>[1]);
          break;
        case 'patch':
          response = await this.request.patch(
            url,
            opts as Parameters<APIRequestContext['patch']>[1],
          );
          break;
        case 'delete':
          response = await this.request.delete(
            url,
            opts as Parameters<APIRequestContext['delete']>[1],
          );
          break;
        default: {
          const _: never = method;
          throw new Error(`Unsupported HTTP method: ${String(_)}`);
        }
      }

      const status = response.status();
      const body = await response.text();
      if (status === 404) {
        return null;
      }
      if (attempt === 0 && this.isCsrfForbidden(status, body)) {
        await this.refreshCsrfFromContext();
        continue;
      }
      if (!response.ok() && status !== 202) {
        throw new Error(`HTTP ${status} ${response.statusText()} — ${body}`);
      }
      if (!body) {
        return null;
      }
      try {
        return JSON.parse(body) as KubernetesResource;
      } catch {
        throw new Error(`Non-JSON response: ${body}`);
      }
    }
    return null;
  }

  async createResource(
    group: string,
    version: string,
    plural: string,
    spec: KubernetesResource,
    namespace?: string,
  ): Promise<KubernetesResource | null> {
    if (namespace !== undefined && namespace.trim() === '') {
      throw new Error(
        `createResource(${plural}): namespace must be a non-empty string (got ${JSON.stringify(
          namespace,
        )}). ` + 'Set TEST_NAMESPACE or use the API fixture namespace.',
      );
    }
    const path = this.apiCollectionPath(group, version, plural, namespace);
    // Prefer the same URL builder as UI createOrReplace (`/api/kubernetes/apis/...`).
    for (let attempt = 0; attempt < 2; attempt++) {
      const res = await this.request.post(this.url(path), {
        data: spec,
        headers: this.proxyHeaders({
          Accept: 'application/json',
          'Content-Type': 'application/json',
        }),
      });
      const status = res.status();
      const body = await res.text().catch(() => '');
      if (attempt === 0 && this.isCsrfForbidden(status, body)) {
        await this.refreshCsrfFromContext();
        continue;
      }
      if (status === 404) {
        return null;
      }
      if (!res.ok() && status !== 201 && status !== 202) {
        throw new Error(`HTTP ${status} ${res.statusText()} — ${body}`);
      }
      if (body) {
        try {
          const parsed = JSON.parse(body) as KubernetesResource;
          if (parsed && parsed.kind !== 'Status') {
            return parsed;
          }
          // Kubernetes Status objects use a string `status` field; resource status is an object.
          const statusField = (parsed as { status?: unknown } | null)?.status;
          if (parsed?.kind === 'Status' && statusField === 'Failure') {
            throw new Error(`HTTP ${status} create ${plural} failed — ${body.slice(0, 500)}`);
          }
        } catch (error) {
          if (error instanceof Error && error.message.startsWith('HTTP ')) {
            throw error;
          }
          // Non-JSON body on success — fall through to GET
        }
      }
      const name = spec.metadata?.name;
      if (name) {
        return this.getResource(group, version, plural, name, namespace);
      }
      return null;
    }
    return null;
  }

  async deleteResource(
    group: string,
    version: string,
    plural: string,
    name: string,
    namespace?: string,
  ): Promise<KubernetesResource | null> {
    const path = `${this.apiCollectionPath(group, version, plural, namespace)}/${name}`;
    for (let attempt = 0; attempt < 2; attempt++) {
      const res = await this.request.delete(this.url(path), {
        headers: this.proxyHeaders({ Accept: 'application/json' }),
      });
      const status = res.status();
      const body = await res.text().catch(() => '');
      if (status === 404) {
        return null;
      }
      if (attempt === 0 && this.isCsrfForbidden(status, body)) {
        await this.refreshCsrfFromContext();
        continue;
      }
      if (!res.ok() && status !== 202) {
        throw new Error(`HTTP ${status} ${res.statusText()} — ${body}`);
      }
      if (!body) {
        return {
          apiVersion: 'v1',
          kind: 'Status',
          status: 'Success',
        } as unknown as KubernetesResource;
      }
      try {
        return JSON.parse(body) as KubernetesResource;
      } catch {
        return {
          apiVersion: 'v1',
          kind: 'Status',
          status: 'Success',
        } as unknown as KubernetesResource;
      }
    }
    return null;
  }

  async patchResource(
    group: string,
    version: string,
    plural: string,
    name: string,
    patch: JsonPatchOp[],
    namespace?: string,
  ): Promise<KubernetesResource | null> {
    const path = `${this.apiCollectionPath(group, version, plural, namespace)}/${name}`;
    for (let attempt = 0; attempt < 2; attempt++) {
      const res = await this.request.patch(this.url(path), {
        data: patch,
        headers: this.proxyHeaders({
          Accept: 'application/json',
          'Content-Type': 'application/json-patch+json',
        }),
      });
      const status = res.status();
      const body = await res.text().catch(() => '');
      if (status === 404) {
        return null;
      }
      if (attempt === 0 && this.isCsrfForbidden(status, body)) {
        await this.refreshCsrfFromContext();
        continue;
      }
      if (!res.ok()) {
        throw new Error(`HTTP ${status} ${res.statusText()} — ${body}`);
      }
      if (!body) {
        return this.getResource(group, version, plural, name, namespace);
      }
      return JSON.parse(body) as KubernetesResource;
    }
    return null;
  }

  async listResources(
    group: string,
    version: string,
    plural: string,
    namespace?: string,
    queryParams?: Record<string, string>,
  ): Promise<KubernetesListResource> {
    const qs = queryParams ? `?${new URLSearchParams(queryParams).toString()}` : '';
    const res = await this.request.get(
      this.url(`${this.apiCollectionPath(group, version, plural, namespace)}${qs}`),
      { headers: this.proxyHeaders() },
    );
    if (!res.ok()) {
      await this.expectOk(res, `list ${plural}`);
    }
    const body = (await res.json()) as KubernetesListResource;
    return { ...body, items: body.items ?? [] };
  }

  async getResource(
    group: string,
    version: string,
    plural: string,
    name: string,
    namespace?: string,
  ): Promise<KubernetesResource | null> {
    const res = await this.request.get(
      this.url(`${this.apiCollectionPath(group, version, plural, namespace)}/${name}`),
      { headers: this.proxyHeaders() },
    );
    if (res.status() === 404) {
      return null;
    }
    if (!res.ok()) {
      await this.expectOk(res, `get ${plural}/${name}`);
    }
    return (await res.json()) as KubernetesResource;
  }

  async getResourceByKind(
    kind: string,
    name: string,
    namespace?: string,
  ): Promise<KubernetesResource | null> {
    const { group, version, plural } = resolveKind(kind);
    return this.getResource(group, version, plural, name, namespace);
  }

  async mergePatchResource(
    group: string,
    version: string,
    plural: string,
    name: string,
    patch: Record<string, unknown>,
    namespace?: string,
  ): Promise<KubernetesResource | null> {
    const path = `${this.apiCollectionPath(group, version, plural, namespace)}/${name}`;
    for (let attempt = 0; attempt < 2; attempt++) {
      const res = await this.request.patch(this.url(path), {
        data: patch,
        headers: this.proxyHeaders({
          Accept: 'application/json',
          'Content-Type': 'application/merge-patch+json',
        }),
      });
      const status = res.status();
      const body = await res.text().catch(() => '');
      if (status === 404) {
        return null;
      }
      if (attempt === 0 && this.isCsrfForbidden(status, body)) {
        await this.refreshCsrfFromContext();
        continue;
      }
      if (!res.ok()) {
        throw new Error(`merge-patch ${plural}/${name} failed (${status}): ${body.slice(0, 500)}`);
      }
      if (!body) {
        return this.getResource(group, version, plural, name, namespace);
      }
      return JSON.parse(body) as KubernetesResource;
    }
    return null;
  }

  async getConfigMap(name: string, namespace: string): Promise<KubernetesResource | null> {
    return this.getResource('', 'v1', 'configmaps', name, namespace);
  }

  async patchConfigMap(
    name: string,
    namespace: string,
    patchPayload: JsonPatchOp[],
  ): Promise<KubernetesResource | null> {
    const res = await this.request.patch(
      this.url(`/api/v1/namespaces/${namespace}/configmaps/${name}`),
      {
        data: patchPayload,
        headers: this.proxyHeaders({ 'Content-Type': 'application/json-patch+json' }),
      },
    );
    if (!res.ok()) {
      await this.expectOk(res, `patch ConfigMap/${namespace}/${name}`);
    }
    return (await res.json()) as KubernetesResource;
  }

  async createConfigMapResource(
    namespace: string,
    name: string,
    data: Record<string, string>,
  ): Promise<void> {
    await this.createOrReplace({
      apiVersion: 'v1',
      kind: 'ConfigMap',
      metadata: { name, namespace },
      data,
    } as K8sObject & { data: Record<string, string> });
  }

  async createSSHKeySecret(namespace: string, name: string, sshPublicKey?: string): Promise<void> {
    const pubKey = sshPublicKey ?? SSH_CONFIG.PUBLIC_KEY;
    await this.createOrReplace({
      apiVersion: 'v1',
      kind: 'Secret',
      metadata: { name, namespace },
      type: 'Opaque',
      data: { key: Buffer.from(pubKey).toString('base64') },
    } as K8sObject & { type: string; data: Record<string, string> });
  }

  async createTemplate(namespace: string, spec: KubernetesResource): Promise<KubernetesResource> {
    return this.requireResource(await this.template.create(namespace, spec), 'createTemplate');
  }

  async createVmFromTemplate(
    templateName: string,
    vmName: string,
    namespace: string,
    templateNamespace = 'openshift',
    startVm = true,
    sshPublicKey?: string,
  ): Promise<string> {
    const template = await this.getResource(
      'template.openshift.io',
      'v1',
      'templates',
      templateName,
      templateNamespace,
    );
    if (!template) {
      throw new Error(`Template '${templateName}' not found in namespace '${templateNamespace}'`);
    }

    const processedTemplate: KubernetesResource = {
      ...template,
      metadata: {
        ...template.metadata,
        namespace,
        resourceVersion: undefined,
        uid: undefined,
      },
    };
    const parameters = processedTemplate.parameters as
      | Array<{ name: string; value?: string }>
      | undefined;
    const nameParam = parameters?.find((p) => p.name === 'NAME');
    if (nameParam) {
      nameParam.value = vmName;
    }

    const processedRes = await this.request.post(
      this.url(`/apis/template.openshift.io/v1/namespaces/${namespace}/processedtemplates`),
      {
        data: processedTemplate,
        headers: this.proxyHeaders({ 'Content-Type': 'application/json' }),
      },
    );
    await this.expectOk(processedRes, `process template ${templateName}`);
    const processed = (await processedRes.json()) as { objects?: KubernetesResource[] };
    const vmSpec = processed.objects?.[0];
    if (!vmSpec) {
      throw new Error(`Processed template '${templateName}' returned no objects`);
    }

    vmSpec.spec = vmSpec.spec || {};
    (vmSpec.spec as Record<string, unknown>).runStrategy = startVm ? 'Always' : 'Halted';
    if (sshPublicKey) {
      const secretName = `${vmName}-ssh-key`;
      await this.createSSHKeySecret(namespace, secretName, sshPublicKey);
      this.trackResource('Secret', secretName, namespace);
    }
    vmSpec.metadata = { ...vmSpec.metadata, name: vmName, namespace };
    await this.createOrReplace(vmSpec as K8sObject);
    return vmSpec.metadata?.name || vmName;
  }

  async namespaceExists(name: string): Promise<boolean> {
    return (await this.getNamespace(name)) !== null;
  }

  async secretExists(namespace: string, name: string): Promise<boolean> {
    return this.resourceExists({
      apiVersion: 'v1',
      kind: 'Secret',
      metadata: { name, namespace },
    });
  }

  async getVirtualMachineSnapshot(
    namespace: string,
    name: string,
  ): Promise<KubernetesResource | null> {
    return this.getResource(
      'snapshot.kubevirt.io',
      'v1alpha1',
      'virtualmachinesnapshots',
      name,
      namespace,
    );
  }

  async getVmDiskBus(vmName: string, namespace: string, diskName: string): Promise<string | null> {
    const vm = (await this.getVirtualMachine(namespace, vmName)) as KubernetesResource | null;
    if (!vm) {
      return null;
    }
    const spec = vm.spec as Record<string, unknown> | undefined;
    const templateSpec =
      ((spec?.template as Record<string, unknown> | undefined)?.spec as
        | Record<string, unknown>
        | undefined) || {};
    const domain = (templateSpec.domain as Record<string, unknown> | undefined) || {};
    const devices = (domain.devices as Record<string, unknown> | undefined) || {};
    const disks = (devices.disks as Array<Record<string, unknown>>) || [];
    const disk = disks.find((d) => d.name === diskName);
    if (!disk) {
      return null;
    }
    const diskInfo = disk.disk as Record<string, unknown> | undefined;
    if (diskInfo?.bus) {
      return diskInfo.bus as string;
    }
    const cdromInfo = disk.cdrom as Record<string, unknown> | undefined;
    if (cdromInfo?.bus) {
      return cdromInfo.bus as string;
    }
    return null;
  }

  async verifyVmCreated(
    vmName: string,
    namespace: string,
    timeoutMs = TestTimeouts.VM_BOOTUP,
  ): Promise<{ exists: boolean }> {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      if (await this.virtualMachineExists(vmName, namespace)) {
        return { exists: true };
      }
      await new Promise((r) => setTimeout(r, 3000));
    }
    return { exists: false };
  }

  async verifyTemplateCreated(
    name: string,
    namespace: string,
    timeoutMs = 10_000,
  ): Promise<{ exists: boolean }> {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      const tpl = await this.getResource(
        'template.openshift.io',
        'v1',
        'templates',
        name,
        namespace,
      );
      if (tpl) {
        return { exists: true };
      }
      await new Promise((r) => setTimeout(r, 2000));
    }
    return { exists: false };
  }

  async waitForVmDeleted(vmName: string, namespace: string, timeoutMs = 60_000): Promise<boolean> {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      if (!(await this.virtualMachineExists(vmName, namespace))) {
        return true;
      }
      await new Promise((r) => setTimeout(r, 3000));
    }
    return false;
  }

  // ---------------------------------------------------------------------------
  // API contract surface — flat delegates to console-proxy handlers (main parity)
  // ---------------------------------------------------------------------------

  async checkPluginHealth(): Promise<boolean> {
    const origin = this.consoleOrigin.replace(/\/$/, '');
    const url = `${origin}/api/proxy/plugin/kubevirt-plugin/kubevirt-apiserver-proxy/health`;
    const response = await this.request.get(url, { headers: this.proxyHeaders() });
    return response.ok();
  }

  async createDataSource(namespace: string, spec: KubernetesResource): Promise<KubernetesResource> {
    return this.requireResource(
      await this.cdi.createDataSource(namespace, spec),
      'createDataSource',
    );
  }

  async createDataVolume(namespace: string, spec: KubernetesResource): Promise<KubernetesResource> {
    return this.requireResource(
      await this.cdi.createDataVolume(namespace, spec),
      'createDataVolume',
    );
  }

  async createMigrationPolicy(spec: KubernetesResource): Promise<KubernetesResource> {
    return this.requireResource(
      await this.infra.createMigrationPolicy(spec),
      'createMigrationPolicy',
    );
  }

  createMultiNsStorageMigrationPlan(spec: KubernetesResource, namespace: string) {
    return this.infra.createMultiNsStorageMigrationPlan(spec, namespace);
  }

  async createVirtualMachine(
    namespace: string,
    spec: KubernetesResource,
  ): Promise<KubernetesResource> {
    return this.requireResource(await this.vm.create(namespace, spec), 'createVirtualMachine');
  }

  async createVirtualMachineClusterInstanceType(
    spec: KubernetesResource,
  ): Promise<KubernetesResource> {
    return this.requireResource(
      await this.instanceType.createClusterInstanceType(spec),
      'createVirtualMachineClusterInstanceType',
    );
  }

  async createVirtualMachineInstanceMigration(
    namespace: string,
    spec: KubernetesResource,
  ): Promise<KubernetesResource> {
    return this.requireResource(
      await this.vm.createMigration(namespace, spec),
      'createVirtualMachineInstanceMigration',
    );
  }

  async createVirtualMachineInstanceType(
    namespace: string,
    spec: KubernetesResource,
  ): Promise<KubernetesResource> {
    return this.requireResource(
      await this.instanceType.createInstanceType(namespace, spec),
      'createVirtualMachineInstanceType',
    );
  }

  async createVirtualMachineRestore(
    namespace: string,
    spec: KubernetesResource,
  ): Promise<KubernetesResource> {
    return this.requireResource(
      await this.snapshot.createRestore(namespace, spec),
      'createVirtualMachineRestore',
    );
  }

  async createVirtualMachineSnapshot(
    namespace: string,
    spec: KubernetesResource,
  ): Promise<KubernetesResource> {
    return this.requireResource(
      await this.snapshot.create(namespace, spec),
      'createVirtualMachineSnapshot',
    );
  }

  deleteDataVolume(namespace: string, name: string) {
    return this.cdi.deleteDataVolume(namespace, name);
  }
  deleteMultiNsStorageMigrationPlan(name: string, namespace: string) {
    return this.infra.deleteMultiNsStorageMigrationPlan(name, namespace);
  }

  deleteTemplate(namespace: string, name: string) {
    return this.template.delete(namespace, name);
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

  deleteVirtualMachineRestore(namespace: string, name: string) {
    return this.snapshot.deleteRestore(namespace, name);
  }

  getCdiConfig() {
    return this.cdi.getCdiConfig();
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

  getDataVolumes(namespace?: string) {
    return this.cdi.listDataVolumes(namespace);
  }

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

  getStorageClasses() {
    return this.core.getStorageClasses();
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

  getTemplates(namespace?: string, labelSelector?: string) {
    return this.template.list(namespace, labelSelector);
  }

  getVirtualMachineClusterInstanceTypes() {
    return this.instanceType.listClusterInstanceTypes();
  }

  getVirtualMachineClusterPreferences() {
    return this.instanceType.listClusterPreferences();
  }

  getVirtualMachineInstanceMigration(namespace: string, name: string) {
    return this.vm.getMigration(namespace, name);
  }

  getVirtualMachineInstanceMigrations(namespace?: string, queryParams?: Record<string, string>) {
    return this.vm.listMigrations(namespace, queryParams);
  }

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

  getVirtualMachines(namespace?: string, queryParams?: Record<string, string>) {
    return this.vm.list(namespace, queryParams);
  }

  getVirtualMachineSnapshots(namespace: string) {
    return this.snapshot.list(namespace);
  }

  getVolumeSnapshots(namespace: string) {
    return this.snapshot.listVolumeSnapshots(namespace);
  }

  patchDataSource(namespace: string, name: string, patch: JsonPatchOp[]) {
    return this.cdi.patchDataSource(namespace, name, patch);
  }

  patchDataVolume(namespace: string, name: string, patch: JsonPatchOp[]) {
    return this.cdi.patchDataVolume(namespace, name, patch);
  }

  patchMigrationPolicy(name: string, patch: JsonPatchOp[]) {
    return this.infra.patchMigrationPolicy(name, patch);
  }

  patchTemplate(namespace: string, name: string, patch: JsonPatchOp[]) {
    return this.template.patch(namespace, name, patch);
  }

  patchVirtualMachine(namespace: string, name: string, patch: JsonPatchOp[]) {
    return this.vm.patch(namespace, name, patch);
  }

  restartVirtualMachine(namespace: string, name: string) {
    return this.vm.restart(namespace, name);
  }

  stopVirtualMachine(namespace: string, name: string) {
    return this.vm.stop(namespace, name);
  }

  async waitForSnapshotReady(
    snapshotName: string,
    namespace: string,
    timeoutMs = 120_000,
  ): Promise<boolean> {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      try {
        const snap = await this.getVirtualMachineSnapshot(namespace, snapshotName);
        if ((snap?.status as Record<string, unknown>)?.readyToUse === true) return true;
      } catch {
        // not ready yet
      }
      await new Promise((r) => setTimeout(r, 3000));
    }
    return false;
  }

  waitForVmExists(vmName: string, namespace: string, timeoutMs?: number) {
    return this.vm.waitForVmExists(namespace, vmName, timeoutMs);
  }

  waitForVmRunning(vmName: string, namespace: string, timeoutMs?: number) {
    return this.vm.waitForVmRunning(namespace, vmName, timeoutMs);
  }
}

export { RequestContextClient };
