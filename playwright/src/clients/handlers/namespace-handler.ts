import type { KubernetesListResource, KubernetesResource } from '@/data-models/kubernetes-types';
import { getErrorMessage } from '@/data-models/kubernetes-types';
import { EnvVariables } from '@/utils/env-variables';
import { TestTimeouts } from '@/utils/test-config';
import type * as k8s from '@kubernetes/client-node';

import { getKubernetesProxyUrl, makeKubernetesProxyRequest } from '../kubernetes-proxy';

import type { KubernetesHandlerContext } from './kubernetes-api-context';
import type { NamespaceCheckupMethods } from './namespace-checkup-handler';
import { applyCheckupDelegations } from './namespace-checkup-handler';
import type { NamespaceRbacMethods } from './namespace-rbac-handler';
import { applyRbacDelegations } from './namespace-rbac-handler';
import type { NamespaceSetupMethods } from './namespace-setup-handler';
import { applySetupDelegations } from './namespace-setup-handler';
import type { SecretConfigMapHandler } from './secret-configmap-handler';
import type { VirtualMachineHandler } from './vm-handler';

/** Narrow unknown API errors for status/body checks (client-node / proxy). */
function asK8sClientError(error: unknown): {
  statusCode?: number;
  code?: number;
  body?: { code?: number };
  response?: { statusCode?: number; status?: number };
} {
  return error as {
    statusCode?: number;
    code?: number;
    body?: { code?: number };
    response?: { statusCode?: number; status?: number };
  };
}

function unwrapApiBody<T>(response: unknown): T {
  if (typeof response === 'object' && response !== null && 'body' in response) {
    return (response as { body: T }).body;
  }
  return response as T;
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging, @typescript-eslint/no-empty-object-type
export interface NamespaceHandler
  extends NamespaceRbacMethods,
    NamespaceSetupMethods,
    NamespaceCheckupMethods {}

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class NamespaceHandler {
  constructor(
    private readonly ctx: KubernetesHandlerContext,
    private readonly secret: SecretConfigMapHandler,
    private readonly vm: VirtualMachineHandler,
  ) {}

  async namespaceExists(name: string): Promise<boolean> {
    try {
      const ns = await this.ctx.withRetry(
        () => this.ctx.getNamespaceByName(name),
        `Check namespace ${name} exists`,
      );
      return !!ns;
    } catch (error: unknown) {
      const e = asK8sClientError(error);
      const msg = getErrorMessage(error);
      if (
        e.statusCode === 404 ||
        e.code === 404 ||
        e.body?.code === 404 ||
        e.response?.statusCode === 404 ||
        msg.includes('404') ||
        msg.includes('not found') ||
        msg.includes('NotFound')
      ) {
        return false;
      }
      throw new Error(`Failed to check namespace ${name}: ${msg}`);
    }
  }

  /** Returns the htpasswd credential username for the non-priv test user (TEST_USERNAME env, default "test"). */
  protected _nonPrivUsername(): string {
    return EnvVariables.testUsername;
  }

  async createNamespace(name: string, labels?: Record<string, string>): Promise<boolean> {
    try {
      const namespaceManifest: k8s.V1Namespace = {
        apiVersion: 'v1',
        kind: 'Namespace',
        metadata: {
          name,
          labels,
        },
      };
      await this.ctx.createNamespaceResource(namespaceManifest);
      if (EnvVariables.isNonPrivUser) {
        const username = this._nonPrivUsername();
        await this.grantUserAccessToNamespace(name, username);
        await this.grantUserKubevirtAccessToNamespace(name, username);
      }
      return true;
    } catch (error: unknown) {
      const e = asK8sClientError(error);
      const msg = getErrorMessage(error);
      if (
        e.statusCode === 409 ||
        e.code === 409 ||
        e.body?.code === 409 ||
        e.response?.statusCode === 409 ||
        msg.includes('409') ||
        msg.includes('already exists') ||
        msg.includes('AlreadyExists')
      ) {
        if (EnvVariables.isNonPrivUser) {
          const username = this._nonPrivUsername();
          await this.grantUserAccessToNamespace(name, username);
          await this.grantUserKubevirtAccessToNamespace(name, username);
        }
        return true;
      }
      throw new Error(`Failed to create namespace ${name}: ${msg}`);
    }
  }

  async waitForTestUserInNamespace(
    namespace: string,
    username: string,
    timeoutMs = 15 * 1000,
  ): Promise<void> {
    const bindingName = 'test-user-admin';
    const deadline = Date.now() + timeoutMs;
    const pollMs = TestTimeouts.POLLING_INTERVAL;

    while (Date.now() < deadline) {
      try {
        const existing = await this.ctx.rbacApi.readNamespacedRoleBinding({
          name: bindingName,
          namespace,
        });
        const body = unwrapApiBody<KubernetesResource>(existing);
        const subjects = Array.isArray(body.subjects) ? body.subjects : [];
        const hasUser = subjects.some(
          (s: { kind?: string; name?: string }) => s.kind === 'User' && s.name === username,
        );
        if (hasUser) {
          return;
        }
      } catch {
        // RoleBinding may not exist yet or not have user
      }
      await new Promise((resolve) => setTimeout(resolve, pollMs));
    }
    throw new Error(
      `Test user ${username} was not in namespace ${namespace} within ${timeoutMs}ms`,
    );
  }

  protected isSystemNamespaceExcludedForTestUser(namespace: string): boolean {
    return namespace === 'default' || namespace.startsWith('openshift-');
  }

  async deleteNamespace(name: string, options?: { ignoreNotFound?: boolean }): Promise<boolean> {
    try {
      await this.ctx.coreV1Api.deleteNamespace({
        name,
      });
      return true;
    } catch (error: unknown) {
      const e = asK8sClientError(error);
      const msg = getErrorMessage(error);
      if (e.statusCode === 404 || e.body?.code === 404) {
        if (options?.ignoreNotFound) {
          return true;
        }
        return false;
      }
      throw new Error(`Failed to delete namespace ${name}: ${msg}`);
    }
  }

  async waitForNamespaceReady(name: string, timeout = 30000): Promise<boolean> {
    const pollInterval = 1000;
    const startTime = Date.now();

    if (getKubernetesProxyUrl()) {
      while (Date.now() - startTime < timeout) {
        try {
          const ns = await makeKubernetesProxyRequest(
            this.ctx.kc,
            'GET',
            `/api/v1/namespaces/${name}`,
          );
          const unwrapped = unwrapApiBody<KubernetesResource>(ns as unknown);
          const phase = (unwrapped.status as { phase?: string } | undefined)?.phase;

          if (phase === 'Active') {
            return true;
          }
        } catch (error: unknown) {
          const e = asK8sClientError(error);
          const msg = getErrorMessage(error);
          const is404 = e.statusCode === 404 || e.body?.code === 404 || msg.includes('404');
          if (!is404) {
            throw new Error(`Failed to check namespace ${name} status: ${msg}`);
          }
        }

        await new Promise((resolve) => setTimeout(resolve, pollInterval));
      }

      return false;
    }

    while (Date.now() - startTime < timeout) {
      try {
        const ns = await this.ctx.getNamespaceByName(name);
        const unwrapped = unwrapApiBody<KubernetesResource>(ns as unknown);
        const phase = (unwrapped.status as { phase?: string } | undefined)?.phase;

        if (phase === 'Active') {
          return true;
        }
      } catch (error: unknown) {
        const e = asK8sClientError(error);
        const msg = getErrorMessage(error);
        if (e.statusCode !== 404 && e.body?.code !== 404) {
          throw new Error(`Failed to check namespace ${name} status: ${msg}`);
        }
      }

      await new Promise((resolve) => setTimeout(resolve, pollInterval));
    }

    return false;
  }

  async getNamespaces(): Promise<string[]> {
    if (getKubernetesProxyUrl()) {
      try {
        const body = await makeKubernetesProxyRequest(this.ctx.kc, 'GET', '/api/v1/namespaces');
        const items = (body as unknown as KubernetesListResource<KubernetesResource>).items ?? [];
        return items
          .map((item) => item.metadata?.name)
          .filter((n): n is string => typeof n === 'string');
      } catch (error: unknown) {
        throw new Error(`Failed to list namespaces: ${getErrorMessage(error)}`);
      }
    }

    try {
      const response = await this.ctx.coreV1Api.listNamespace();
      const responseBody = unwrapApiBody<KubernetesListResource>(response as unknown);
      const items = responseBody.items ?? [];
      return items
        .map((item) => item.metadata?.name)
        .filter((n): n is string => typeof n === 'string');
    } catch (error: unknown) {
      throw new Error(`Failed to list namespaces: ${getErrorMessage(error)}`);
    }
  }

  async getNamespaceCount(excludeSystem = true, onlyWithVms = false): Promise<number> {
    const names = await this.getNamespaces();
    let filtered = names;
    if (excludeSystem) {
      filtered = filtered.filter(
        (n) => !n.startsWith('kube-') && !n.startsWith('openshift-') && n !== 'default',
      );
    }
    if (!onlyWithVms) return filtered.length;
    let count = 0;
    for (const ns of filtered) {
      const vms = await this.vm.listVirtualMachines(ns);
      if (vms.length > 0) count += 1;
    }
    return count;
  }

  async setupTestNamespace(namespace: string, labels?: Record<string, string>): Promise<boolean> {
    const exists = await this.namespaceExists(namespace);

    if (exists) {
      const isReady = await this.waitForNamespaceReady(namespace);
      if (!isReady) {
        throw new Error(`Namespace ${namespace} exists but did not become Active`);
      }
      if (EnvVariables.isNonPrivUser) {
        await this.grantUserAccessToNamespace(namespace, EnvVariables.uiLoginUsername);
        await this.grantUserKubevirtAccessToNamespace(namespace, EnvVariables.uiLoginUsername);
      }
      return true;
    }

    const created = await this.createNamespace(namespace, labels);

    if (created) {
      const isReady = await this.waitForNamespaceReady(namespace);
      if (!isReady) {
        throw new Error(`Namespace ${namespace} was created but did not become Active`);
      }
    }
    return created;
  }

  async cleanupTestNamespace(namespace: string): Promise<void> {
    await Promise.allSettled([
      this.ctx.deleteAllCustomResources('kubevirt.io', 'v1', 'virtualmachineinstances', namespace, {
        ignoreErrors: true,
      }),
    ]);

    await this.ctx.deleteAllCustomResources('kubevirt.io', 'v1', 'virtualmachines', namespace, {
      ignoreErrors: true,
    });

    await Promise.allSettled([
      this.ctx.deleteAllCustomResources('template.openshift.io', 'v1', 'templates', namespace, {
        ignoreErrors: true,
      }),
      this.ctx.deleteAllCustomResources(
        'snapshot.kubevirt.io',
        'v1beta1',
        'virtualmachinesnapshots',
        namespace,
        { ignoreErrors: true },
      ),
      this.secret.deleteAllSecrets(namespace, { ignoreErrors: true }),
      this.ctx.deleteAllCustomResources(
        'k8s.cni.cncf.io',
        'v1',
        'network-attachment-definitions',
        namespace,
        { ignoreErrors: true },
      ),
      this.ctx.deleteAllCustomResources(
        'instancetype.kubevirt.io',
        'v1beta1',
        'virtualmachineinstancetypes',
        namespace,
        { ignoreErrors: true },
      ),
      this.ctx.deleteAllCustomResources(
        'instancetype.kubevirt.io',
        'v1beta1',
        'virtualmachinepreferences',
        namespace,
        { ignoreErrors: true },
      ),
      this.ctx.deleteAllCustomResources(
        'kubevirt.io',
        'v1',
        'virtualmachineinstancemigrations',
        namespace,
        { ignoreErrors: true },
      ),
      this.ctx.deleteAllCustomResources('k8s.ovn.org', 'v1', 'userdefinednetworks', namespace, {
        ignoreErrors: true,
      }),
      this.secret.deleteConfigMapsWithPrefix(namespace, 'sysprep-', { ignoreErrors: true }),
    ]);
  }

  async waitForPodReady(namespace: string, podName: string, timeoutMs = 60000): Promise<boolean> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
      try {
        const response = await this.ctx.coreV1Api.readNamespacedPod({ name: podName, namespace });
        const pod = response;

        if (
          pod.status?.phase === 'Running' &&
          pod.status?.conditions?.some(
            (c: k8s.V1PodCondition) => c.type === 'Ready' && c.status === 'True',
          )
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

  async serviceExists(name: string, namespace: string): Promise<boolean> {
    try {
      await (
        this.ctx.coreV1Api as unknown as {
          readNamespacedService: (p: { name: string; namespace: string }) => Promise<unknown>;
        }
      ).readNamespacedService({ name, namespace });
      return true;
    } catch (error: unknown) {
      const e = asK8sClientError(error);
      const msg = getErrorMessage(error);
      if (
        e.statusCode === 404 ||
        e.response?.status === 404 ||
        msg.includes('404') ||
        msg.includes('not found')
      ) {
        return false;
      }
      throw error;
    }
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

  async getPods(namespace: string) {
    try {
      const response = await this.ctx.coreV1Api.listNamespacedPod({ namespace });
      return response.items || [];
    } catch (error: unknown) {
      throw new Error(`Failed to get pods in namespace ${namespace}: ${getErrorMessage(error)}`);
    }
  }

  protected parseQuantityToBytes(q: string | undefined): number {
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

  protected isAlreadyExistsK8sError(error: unknown): boolean {
    const e = error as {
      statusCode?: number;
      response?: { status?: number; statusCode?: number };
      message?: string;
    };
    return (
      e.statusCode === 409 ||
      e.response?.status === 409 ||
      e.response?.statusCode === 409 ||
      e.message?.includes('409') ||
      e.message?.includes('AlreadyExists') ||
      e.message?.includes('already exists') ||
      false
    );
  }

  protected isNotFoundK8sError(error: unknown): boolean {
    const e = error as {
      statusCode?: number;
      response?: { status?: number; statusCode?: number };
      message?: string;
    };
    return (
      e.statusCode === 404 ||
      e.response?.status === 404 ||
      e.response?.statusCode === 404 ||
      e.message?.includes('404') ||
      e.message?.includes('not found') ||
      e.message?.includes('NotFound') ||
      false
    );
  }
}

applyRbacDelegations(NamespaceHandler.prototype);
applySetupDelegations(NamespaceHandler.prototype);
applyCheckupDelegations(NamespaceHandler.prototype);
