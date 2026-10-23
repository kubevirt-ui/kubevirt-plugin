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
import { getConsoleKubernetesProxyHeaders } from '@/utils/console-kubernetes-proxy';
import { patchConsoleUserSettingsViaConsoleProxy } from '@/utils/console-user-settings';
import { EnvVariables } from '@/utils/env-variables';
import {
  enableInstanceTypesDeveloperPreviewOnCluster,
  enableInstanceTypesDeveloperPreviewViaConsoleApi,
  INSTANCE_TYPE_ENABLED,
  patchKubevirtUiFeatureViaConsoleProxy,
} from '@/utils/kubevirt-ui-features';
import { patchKubevirtUserSettingsHideWelcomeViaConsoleProxy } from '@/utils/kubevirt-user-settings';
import {
  configMapManifest,
  dataSourceManifest,
  migratableVirtualMachineManifest,
  migrationPolicyManifest,
  networkAttachmentDefinitionManifest,
  openshiftTemplateManifest,
  persistentVolumeClaimManifest,
  virtualMachineClusterPreferenceManifest,
  virtualMachineInstancetypeManifest,
  virtualMachineManifest,
} from '@/utils/manifests';
import { pollUntil } from '@/utils/poll-until';
import { SECOND, TestTimeouts } from '@/utils/test-config';
import type { APIRequestContext } from '@playwright/test';

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
};

const KIND_PLURAL: Record<string, string> = {
  ConfigMap: 'configmaps',
  DataSource: 'datasources',
  MigrationPolicy: 'migrationpolicies',
  Namespace: 'namespaces',
  // Console bridge + OpenShift model use hyphenated plural (legacyPluralURL).
  NetworkAttachmentDefinition: 'network-attachment-definitions',
  PersistentVolumeClaim: 'persistentvolumeclaims',
  Template: 'templates',
  VirtualMachine: 'virtualmachines',
  VirtualMachineClusterPreference: 'virtualmachineclusterpreferences',
  VirtualMachineInstance: 'virtualmachineinstances',
  VirtualMachineInstancetype: 'virtualmachineinstancetypes',
  VirtualMachineSnapshot: 'virtualmachinesnapshots',
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
export default class RequestContextClient {
  constructor(
    private readonly request: APIRequestContext,
    private readonly consoleOrigin: string,
  ) {}

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
    const tmp = path.join(os.tmpdir(), `pw-k8s-${doc.kind}-${Date.now()}.yaml`);
    fs.writeFileSync(tmp, yaml.dump(doc), 'utf8');
    try {
      runOcCommand(`oc apply -f "${tmp}"`, kubeconfig);
    } finally {
      fs.unlinkSync(tmp);
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

  private proxyHeaders(extra?: Record<string, string>): Record<string, string> {
    return { ...getConsoleKubernetesProxyHeaders(this.consoleOrigin), ...extra };
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
    await this.applyYaml(
      persistentVolumeClaimManifest({ name, namespace, sizeGiB, storageClassName }),
    );
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

  async applyVirtualMachineClusterPreferenceExample(name = 'example'): Promise<void> {
    await this.applyYaml(virtualMachineClusterPreferenceManifest({ name }));
  }

  async applyVirtualMachineExample(namespace: string, name = 'example'): Promise<void> {
    await this.applyYaml(virtualMachineManifest({ name, namespace }));
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
    await this.deleteResource({
      apiVersion: 'v1',
      kind: 'ConfigMap',
      metadata: { name, namespace },
    });
  }

  async deleteDataSource(name: string, namespace: string): Promise<void> {
    await this.deleteResource({
      apiVersion: 'cdi.kubevirt.io/v1beta1',
      kind: 'DataSource',
      metadata: { name, namespace },
    });
  }

  async deleteMigrationPolicy(name: string): Promise<void> {
    await this.deleteResource({
      apiVersion: 'migrations.kubevirt.io/v1alpha1',
      kind: 'MigrationPolicy',
      metadata: { name },
    });
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
    await this.deleteResource({
      apiVersion: 'k8s.cni.cncf.io/v1',
      kind: 'NetworkAttachmentDefinition',
      metadata: { name, namespace },
    });
  }

  async deleteOpenshiftTemplate(name: string, namespace: string): Promise<void> {
    await this.deleteResource({
      apiVersion: 'template.openshift.io/v1',
      kind: 'Template',
      metadata: { name, namespace },
    });
  }

  async deletePersistentVolumeClaim(name: string, namespace: string): Promise<void> {
    await this.deleteResource({
      apiVersion: 'v1',
      kind: 'PersistentVolumeClaim',
      metadata: { name, namespace },
    });
  }

  async deleteResource(
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
    if (this.ocDeleteWhenProxyForbidden(doc, status)) {
      return;
    }
    await this.expectOk(del, `DELETE ${doc.kind}/${name}`);
  }

  async deleteVirtualMachine(name: string, namespace: string): Promise<void> {
    await this.deleteResource({
      apiVersion: 'kubevirt.io/v1',
      kind: 'VirtualMachine',
      metadata: { name, namespace },
    });
    await this.deleteResource({
      apiVersion: 'kubevirt.io/v1',
      kind: 'VirtualMachineInstance',
      metadata: { name, namespace },
    });
  }

  async deleteVirtualMachineClusterPreference(name: string): Promise<void> {
    await this.deleteResource({
      apiVersion: 'instancetype.kubevirt.io/v1alpha2',
      kind: 'VirtualMachineClusterPreference',
      metadata: { name },
    });
  }

  async deleteVirtualMachineInstancetype(name: string, namespace: string): Promise<void> {
    await this.deleteResource({
      apiVersion: 'instancetype.kubevirt.io/v1alpha2',
      kind: 'VirtualMachineInstancetype',
      metadata: { name, namespace },
    });
  }

  async deleteVirtualMachineSnapshot(name: string, namespace: string): Promise<void> {
    await this.deleteResource({
      apiVersion: 'snapshot.kubevirt.io/v1alpha1',
      kind: 'VirtualMachineSnapshot',
      metadata: { name, namespace },
    });
  }

  async disableInstanceTypesDeveloperPreview(cnvNamespace?: string): Promise<void> {
    await patchKubevirtUiFeatureViaConsoleProxy(
      this.request,
      this.consoleOrigin,
      INSTANCE_TYPE_ENABLED,
      'false',
      cnvNamespace,
    );
  }

  async enableInstanceTypesDeveloperPreview(cnvNamespace?: string): Promise<void> {
    if (EnvVariables.isNonPrivUser && canRunOc()) {
      await enableInstanceTypesDeveloperPreviewOnCluster({ cnvNamespace });
      return;
    }
    await enableInstanceTypesDeveloperPreviewViaConsoleApi(this.request, this.consoleOrigin, {
      cnvNamespace,
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

  async getVirtualMachine(
    namespace: string,
    name: string,
  ): Promise<{
    spec?: {
      template?: {
        spec?: {
          volumes?: Array<{ cloudInitNoCloud?: { userData?: string } }>;
        };
      };
    };
    status?: {
      conditions?: Array<{ message?: string; reason?: string; status?: string; type?: string }>;
      printableStatus?: string;
    };
  } | null> {
    const res = await this.request.get(
      this.url(`/apis/kubevirt.io/v1/namespaces/${namespace}/virtualmachines/${name}`),
      { headers: this.proxyHeaders() },
    );
    if (!res.ok()) {
      return null;
    }
    return (await res.json()) as {
      spec?: {
        template?: {
          spec?: {
            volumes?: Array<{ cloudInitNoCloud?: { userData?: string } }>;
          };
        };
      };
      status?: {
        conditions?: Array<{ status?: string; type?: string }>;
        printableStatus?: string;
      };
    };
  }

  async getVirtualMachineCloudInitUserData(namespace: string, name: string): Promise<string> {
    const vm = await this.getVirtualMachine(namespace, name);
    const raw =
      vm?.spec?.template?.spec?.volumes?.find((volume) => volume.cloudInitNoCloud)?.cloudInitNoCloud
        ?.userData ?? '';
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
  ): Promise<{
    status?: {
      conditions?: Array<{ status?: string; type?: string }>;
      migrationState?: { completed?: boolean; endTimestamp?: string };
      phase?: string;
    };
  } | null> {
    const res = await this.request.get(
      this.url(`/apis/kubevirt.io/v1/namespaces/${namespace}/virtualmachineinstances/${name}`),
      { headers: this.proxyHeaders() },
    );
    if (!res.ok()) {
      return null;
    }
    return (await res.json()) as {
      status?: {
        conditions?: Array<{ status?: string; type?: string }>;
        migrationState?: { completed?: boolean; endTimestamp?: string };
        phase?: string;
      };
    };
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

  /**
   * Patch openshift-console-user-settings (welcome modals, catalog onboarding popover).
   * Does not select Template catalog vs InstanceTypes — that remains a UI step in CatalogPage.
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
    await patchConsoleUserSettingsViaConsoleProxy(this.request, this.consoleOrigin, settingsKey);
  }

  /** `kubevirt-ui-features` in openshift-cnv — e.g. `instanceTypesEnabled` (developer preview). */
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
    );
  }

  /** Hide virtualization welcome modal via `default/kubevirt-user-settings`. */
  async patchKubevirtUserSettingsHideWelcome(): Promise<void> {
    await patchKubevirtUserSettingsHideWelcomeViaConsoleProxy(this.request, this.consoleOrigin);
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
    const get = await this.request.get(this.url(resourceInstancePath(full)), {
      headers: this.proxyHeaders(),
    });
    return get.ok();
  }

  async virtualMachineClusterPreferenceExists(name: string): Promise<boolean> {
    return this.resourceExists({
      apiVersion: 'instancetype.kubevirt.io/v1alpha2',
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
      apiVersion: 'instancetype.kubevirt.io/v1alpha2',
      kind: 'VirtualMachineInstancetype',
      metadata: { name, namespace },
    });
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
    const path = this.url(resourceInstancePath(doc));
    let lastPhase = 'unknown';
    await pollUntil(
      async () => {
        const res = await this.request.get(path, { headers: this.proxyHeaders() });
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
      const blocked = vm?.status?.conditions?.find(
        ({ status, type }) => type === 'LiveMigratable' && status === 'False',
      );
      const vmRunning = vm?.status?.printableStatus === 'Running';
      const vmiRunning = !vmi?.status?.phase || vmi.status.phase === 'Running';
      lastState = `printableStatus=${vm?.status?.printableStatus ?? 'n/a'} vmiPhase=${
        vmi?.status?.phase ?? 'n/a'
      } ${RequestContextClient.describeLiveMigratable(vm?.status?.conditions)}`;

      if (vmRunning && vmiRunning && !blocked) {
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
      if (vmi?.status?.migrationState?.completed || vmi?.status?.migrationState?.endTimestamp) {
        return;
      }

      if (sawMigration && vmi?.status?.phase === 'Running') {
        return;
      }

      await new Promise((r) => setTimeout(r, 500));
    }
    throw new Error(`Timed out waiting for live migration to complete for VMI ${vmiName}`);
  }
}

export { RequestContextClient };
