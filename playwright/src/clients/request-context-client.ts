import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

import yaml from 'js-yaml';

import { canRunOc, runOcCommand } from '@/utils/cluster-oc';
import { getConsoleKubernetesProxyHeaders } from '@/utils/console-kubernetes-proxy';
import {
  dataSourceManifest,
  migratableVirtualMachineManifest,
  migrationPolicyManifest,
  networkAttachmentDefinitionManifest,
  openshiftTemplateManifest,
  virtualMachineManifest,
} from '@/utils/manifests';
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

const KIND_PLURAL: Record<string, string> = {
  DataSource: 'datasources',
  MigrationPolicy: 'migrationpolicies',
  Namespace: 'namespaces',
  Template: 'templates',
  VirtualMachine: 'virtualmachines',
  VirtualMachineInstance: 'virtualmachineinstances',
  // Console bridge + OpenShift model use hyphenated plural (legacyPluralURL).
  NetworkAttachmentDefinition: 'network-attachment-definitions',
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
 * (flat helpers for uit-412 CRUD setup). Specs use it through the worker-scoped `apiClient`
 * fixture in `scenario-test-fixture.ts`.
 */
export default class RequestContextClient {
  constructor(
    private readonly request: APIRequestContext,
    private readonly consoleOrigin: string,
  ) {}

  private url(k8sPath: string): string {
    const origin = this.consoleOrigin.replace(/\/$/, '');
    const path = k8sPath.startsWith('/') ? k8sPath : `/${k8sPath}`;
    return `${origin}/api/kubernetes${path}`;
  }

  private proxyHeaders(extra?: Record<string, string>): Record<string, string> {
    return { ...getConsoleKubernetesProxyHeaders(this.consoleOrigin), ...extra };
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

  /** Kubeadmin kubeconfig — used when the console proxy runs as a user without create RBAC (e.g. NAD). */
  private applyDocViaOc(doc: K8sObject): void {
    const tmp = path.join(os.tmpdir(), `pw-e2e-${doc.kind}-${Date.now()}.yaml`);
    fs.writeFileSync(tmp, yaml.dump(doc), 'utf8');
    try {
      const ns = doc.metadata?.namespace;
      const nsFlag = ns ? `-n ${ns}` : '';
      runOcCommand(`oc apply -f "${tmp}" ${nsFlag}`);
    } finally {
      fs.unlinkSync(tmp);
    }
  }

  private async expectOkOrApplyViaOc(
    response: { ok: () => boolean; status: () => number; text: () => Promise<string> },
    doc: K8sObject,
    action: string,
  ): Promise<void> {
    if (response.ok()) {
      return;
    }
    if (response.status() === 403 && canRunOc()) {
      this.applyDocViaOc(doc);
      return;
    }
    await this.expectOk(response, action);
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
      await this.expectOkOrApplyViaOc(put, doc, `PUT ${doc.kind}/${name}`);
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
      await this.expectOkOrApplyViaOc(put, doc, `PUT ${doc.kind}/${name} after conflict`);
      return;
    }
    await this.expectOkOrApplyViaOc(post, doc, `POST ${doc.kind}/${name}`);
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
    const ns = doc.metadata.namespace;
    const del = await this.request.delete(this.url(resourceInstancePath(full)), {
      headers: this.proxyHeaders(),
    });
    if (del.status() === 404) {
      return;
    }
    if (del.status() === 403 && canRunOc()) {
      const ocKind = doc.kind.toLowerCase();
      const nsFlag = ns ? ` -n ${ns}` : '';
      runOcCommand(`oc delete ${ocKind} ${name}${nsFlag} --ignore-not-found --wait=false`);
      return;
    }
    await this.expectOk(del, `DELETE ${doc.kind}/${name}`);
  }

  async getNamespace(
    name: string,
  ): Promise<{ name: string; labels?: Record<string, string> } | null> {
    const get = await this.request.get(this.url(`/api/v1/namespaces/${name}`), {
      headers: this.proxyHeaders(),
    });
    if (!get.ok()) {
      return null;
    }
    const body = (await get.json()) as {
      metadata?: { name?: string; labels?: Record<string, string> };
    };
    const nsName = body.metadata?.name;
    return nsName ? { name: nsName, labels: body.metadata?.labels } : null;
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
      runOcCommand(`oc adm policy add-role-to-user admin test -n ${name} || true`);
    }
  }

  async labelNamespace(name: string, key: string, value: string): Promise<void> {
    const patch = await this.request.patch(this.url(`/api/v1/namespaces/${name}`), {
      data: { metadata: { labels: { [key]: value } } },
      headers: this.proxyHeaders({ 'Content-Type': 'application/merge-patch+json' }),
    });
    await this.expectOk(patch, `label Namespace/${name}`);
  }

  async deleteNamespace(name: string): Promise<void> {
    const del = await this.request.delete(this.url(`/api/v1/namespaces/${name}`), {
      headers: this.proxyHeaders(),
    });
    if (del.status() === 404) {
      return;
    }
    if (del.status() === 403 && canRunOc()) {
      runOcCommand(`oc delete namespace ${name} --wait=false --ignore-not-found`);
      return;
    }
    if (del.ok() || del.status() === 202) {
      return;
    }
    await this.expectOk(del, `delete Namespace/${name}`);
  }

  async applyVirtualMachineExample(namespace: string, name = 'example'): Promise<void> {
    await this.applyYaml(virtualMachineManifest({ name, namespace }));
  }

  async applyMigratableVirtualMachine(namespace: string, name: string): Promise<void> {
    await this.applyYaml(migratableVirtualMachineManifest({ name, namespace }));
  }

  async applyNetworkAttachmentDefinition(namespace: string, name: string): Promise<void> {
    await this.applyYaml(networkAttachmentDefinitionManifest({ name, namespace }));
  }

  async deleteNetworkAttachmentDefinition(name: string, namespace: string): Promise<void> {
    await this.deleteResource({
      apiVersion: 'k8s.cni.cncf.io/v1',
      kind: 'NetworkAttachmentDefinition',
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

  async applyDataSourceExample(namespace: string, name = 'example'): Promise<void> {
    await this.applyYaml(dataSourceManifest({ name, namespace }));
  }

  async applyDataSourceWithAnnotations(
    namespace: string,
    name: string,
    annotations: Record<string, string>,
  ): Promise<void> {
    await this.applyYaml(dataSourceManifest({ name, namespace, annotations }));
  }

  async deleteDataSource(name: string, namespace: string): Promise<void> {
    await this.deleteResource({
      apiVersion: 'cdi.kubevirt.io/v1beta1',
      kind: 'DataSource',
      metadata: { name, namespace },
    });
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

  async virtualMachineExists(name: string, namespace: string): Promise<boolean> {
    return this.resourceExists({
      apiVersion: 'kubevirt.io/v1',
      kind: 'VirtualMachine',
      metadata: { name, namespace },
    });
  }

  async dataSourceExists(name: string, namespace: string): Promise<boolean> {
    return this.resourceExists({
      apiVersion: 'cdi.kubevirt.io/v1beta1',
      kind: 'DataSource',
      metadata: { name, namespace },
    });
  }

  async openshiftTemplateExists(name: string, namespace: string): Promise<boolean> {
    return this.resourceExists({
      apiVersion: 'template.openshift.io/v1',
      kind: 'Template',
      metadata: { name, namespace },
    });
  }

  async migrationPolicyExists(name: string): Promise<boolean> {
    return this.resourceExists({
      apiVersion: 'migrations.kubevirt.io/v1alpha1',
      kind: 'MigrationPolicy',
      metadata: { name },
    });
  }

  async applyMigrationPolicyExample(name = 'example'): Promise<void> {
    await this.applyYaml(migrationPolicyManifest({ name }));
  }

  async deleteMigrationPolicy(name: string): Promise<void> {
    await this.deleteResource({
      apiVersion: 'migrations.kubevirt.io/v1alpha1',
      kind: 'MigrationPolicy',
      metadata: { name },
    });
  }

  async applyOpenshiftTemplate(namespace: string, name = 'pw-template-e2e'): Promise<void> {
    await this.applyYaml(openshiftTemplateManifest({ name, namespace }));
  }

  async deleteOpenshiftTemplate(name: string, namespace: string): Promise<void> {
    await this.deleteResource({
      apiVersion: 'template.openshift.io/v1',
      kind: 'Template',
      metadata: { name, namespace },
    });
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

  async getVirtualMachineInstance(
    namespace: string,
    name: string,
  ): Promise<{
    status?: {
      phase?: string;
      migrationState?: { completed?: boolean; endTimestamp?: string };
      conditions?: Array<{ type?: string; status?: string }>;
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
        phase?: string;
        migrationState?: { completed?: boolean; endTimestamp?: string };
        conditions?: Array<{ type?: string; status?: string }>;
      };
    };
  }

  async getVirtualMachine(
    namespace: string,
    name: string,
  ): Promise<{
    status?: {
      printableStatus?: string;
      conditions?: Array<{ type?: string; status?: string; reason?: string; message?: string }>;
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
      status?: {
        printableStatus?: string;
        conditions?: Array<{ type?: string; status?: string }>;
      };
    };
  }

  private static describeLiveMigratable(
    conditions?: Array<{ type?: string; status?: string; reason?: string; message?: string }>,
  ): string {
    const condition = conditions?.find(({ type }) => type === 'LiveMigratable');
    if (!condition) {
      return 'LiveMigratable=<unset>';
    }
    const detail = [condition.reason, condition.message].filter(Boolean).join(': ');
    return `LiveMigratable=${condition.status}${detail ? ` (${detail})` : ''}`;
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
        ({ type, status }) => type === 'LiveMigratable' && status === 'False',
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

  /** @deprecated Prefer {@link waitForVmiMigrationComplete} */
  async waitForVmInstanceMigration(
    namespace: string,
    vmiName: string,
    timeoutSec = TestTimeouts.MIGRATION_COMPLETION / SECOND,
  ): Promise<void> {
    await this.waitForVmiMigrationComplete(namespace, vmiName, timeoutSec * 1000);
  }
}

export { RequestContextClient };
