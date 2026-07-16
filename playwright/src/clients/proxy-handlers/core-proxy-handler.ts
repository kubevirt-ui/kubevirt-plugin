import * as fs from 'fs';

import { SshKeyFactory } from '@/data-factories/ssh-key-factory';
import type {
  JsonPatchOp,
  KubernetesListResource,
  KubernetesResource,
} from '@/data-models/kubernetes-types';

import type { ProxyApiContext } from './proxy-api-context';

/**
 * Console-proxy handler for Kubernetes core API resources:
 * ConfigMaps, Pods, and PersistentVolumeClaims.
 *
 * Also provides named helpers for the KubeVirt UI feature / user-settings ConfigMaps
 * and the console guided-tour ConfigMap.
 *
 * Note: `patchProject` is intentionally NOT included here because it targets
 * the non-standard `/k8s/cluster/...` URL path (outside `/api/`). It is
 * exposed directly on `RequestContextClient` as a standalone method.
 *
 * Access via `apiClient.core.*`
 */
export class CoreProxyHandler {
  constructor(private readonly ctx: ProxyApiContext) {}

  // ---------------------------------------------------------------------------
  // ConfigMaps
  // ---------------------------------------------------------------------------

  configureUserSettings(
    username = 'kube-admin',
    namespace = 'openshift-cnv',
    favoriteBootableVolumes: string[] = ['fedora'],
    dontShowWelcomeModal = true,
  ): Promise<KubernetesResource | null> {
    const userSettings = {
      favoriteBootableVolumes,
      quickStart: { dontShowWelcomeModal },
    };
    return this.patchConfigMap('kubevirt-user-settings', namespace, [
      { op: 'replace', path: `/data/${username}`, value: JSON.stringify(userSettings) },
    ]);
  }

  createConfigMap(
    namespace: string,
    name: string,
    data: Record<string, string>,
  ): Promise<KubernetesResource | null> {
    const spec: KubernetesResource = {
      apiVersion: 'v1',
      kind: 'ConfigMap',
      metadata: { name, namespace },
      data,
    };
    return this.ctx.createResource('', 'v1', 'configmaps', spec, namespace);
  }

  createSecret(
    namespace: string,
    name: string,
    data: Record<string, string>,
    type = 'Opaque',
  ): Promise<KubernetesResource | null> {
    const encodedData: Record<string, string> = {};
    for (const [k, v] of Object.entries(data)) {
      encodedData[k] = Buffer.from(v).toString('base64');
    }
    const spec: KubernetesResource = {
      apiVersion: 'v1',
      kind: 'Secret',
      metadata: { name, namespace },
      data: encodedData,
      type,
    };
    return this.ctx.createResource('', 'v1', 'secrets', spec, namespace);
  }

  createSSHKeySecret(
    namespace: string,
    name: string,
    sshPublicKey?: string,
  ): Promise<KubernetesResource | null> {
    const pubKey =
      sshPublicKey ?? fs.readFileSync(SshKeyFactory.generatePublicKeyFile(), 'utf-8').trim();
    return this.createSecret(namespace, name, { key: pubKey });
  }

  deleteSecret(namespace: string, name: string): Promise<KubernetesResource | null> {
    return this.ctx.deleteResource('', 'v1', 'secrets', name, namespace);
  }

  getClusterVersion(): Promise<KubernetesResource | null> {
    return this.ctx.getResource('config.openshift.io', 'v1', 'clusterversions', 'version');
  }

  getConfigMap(namespace: string, name: string): Promise<KubernetesResource | null> {
    return this.ctx.getResource('', 'v1', 'configmaps', name, namespace);
  }

  getNodes(): Promise<KubernetesListResource> {
    return this.ctx.listResources('', 'v1', 'nodes');
  }

  getStorageClasses(): Promise<KubernetesListResource> {
    return this.ctx.listResources('storage.k8s.io', 'v1', 'storageclasses');
  }

  // Named helpers for well-known ConfigMaps

  getUiFeatures(namespace = 'openshift-cnv'): Promise<KubernetesResource | null> {
    return this.getConfigMap(namespace, 'kubevirt-ui-features');
  }

  getUserSettings(namespace = 'openshift-cnv'): Promise<KubernetesResource | null> {
    return this.getConfigMap(namespace, 'kubevirt-user-settings');
  }

  listPersistentVolumeClaims(
    namespace: string,
    queryParams?: Record<string, string>,
  ): Promise<KubernetesListResource> {
    return this.ctx.listResources('', 'v1', 'persistentvolumeclaims', namespace, {
      limit: '250',
      ...queryParams,
    });
  }

  listPods(
    namespace: string,
    queryParams?: Record<string, string>,
  ): Promise<KubernetesListResource> {
    return this.ctx.listResources('', 'v1', 'pods', namespace, { limit: '250', ...queryParams });
  }

  patchConfigMap(
    name: string,
    namespace: string,
    patchPayload: JsonPatchOp[],
  ): Promise<KubernetesResource | null> {
    return this.ctx._request(
      'patch',
      `/kubernetes/api/v1/namespaces/${namespace}/configmaps/${name}`,
      {
        data: patchPayload,
        headers: { 'Content-Type': 'application/json-patch+json' },
      },
    );
  }

  async secretExists(namespace: string, name: string): Promise<boolean> {
    try {
      const secret = await this.ctx.getResource('', 'v1', 'secrets', name, namespace);
      return secret !== null;
    } catch {
      return false;
    }
  }

  // ---------------------------------------------------------------------------
  // Pods & PersistentVolumeClaims
  // ---------------------------------------------------------------------------

  setConfirmVmActions(
    enabled: string,
    namespace = 'openshift-cnv',
  ): Promise<KubernetesResource | null> {
    return this.patchConfigMap('kubevirt-ui-features', namespace, [
      { op: 'replace', path: '/data/confirmVMActions', value: enabled },
    ]);
  }

  setConsoleGuidedTourCompleted(
    completed: boolean,
    username = 'kubeadmin',
    namespace = 'openshift-console-user-settings',
  ): Promise<KubernetesResource | null> {
    const configMapName = `user-settings-${username}`;
    const guidedTour = {
      admin: { completed },
      dev: { completed },
      'virtualization-perspective': { completed },
    };
    return this.patchConfigMap(configMapName, namespace, [
      { op: 'replace', path: '/data/console.guidedTour', value: JSON.stringify(guidedTour) },
    ]);
  }
}
