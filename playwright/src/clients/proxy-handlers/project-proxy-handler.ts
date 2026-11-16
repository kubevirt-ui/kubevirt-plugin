import type { KubernetesListResource, KubernetesResource } from '@/data-models/kubernetes-types';

import { canRunOc, resolveKubeconfig, runOcCommand } from '@/utils/cluster-oc';
import { EnvVariables } from '@/utils/env-variables';
import { logger } from '@/utils/logger';
import { ensureDiskUploaderNamespaceRbac } from '@/utils/nonpriv-cluster-rbac';
import { SECOND } from '@/utils/test-config';

import type { ProxyApiContext } from './proxy-api-context';

function isNotFoundMessage(msg: string): boolean {
  return /404|NotFound|not found/i.test(msg);
}

function isForbiddenMessage(msg: string): boolean {
  return /403|Forbidden|401|Unauthorized/i.test(msg);
}

export class ProjectProxyHandler {
  constructor(private readonly ctx: ProxyApiContext) {}

  async createProject(
    name: string,
    labels?: Record<string, string>,
  ): Promise<KubernetesResource | null> {
    const result = await this.ctx._request(
      'post',
      '/kubernetes/apis/project.openshift.io/v1/projectrequests',
      { data: { metadata: { name } } },
    );

    if (labels) {
      try {
        await this.ctx.mergePatchResource('', 'v1', 'namespaces', name, {
          metadata: { labels },
        });
      } catch (error: unknown) {
        // Non-priv sessions can create projects but often cannot patch Namespace objects.
        const msg = error instanceof Error ? error.message : String(error);
        if (!isForbiddenMessage(msg)) {
          throw error;
        }
        logger.warn(`Skipping namespace label patch for "${name}" (forbidden): ${msg}`);
      }
    }

    return result;
  }

  async deleteProject(name: string): Promise<KubernetesResource | null> {
    try {
      // Prefer Project delete — non-priv project admins can delete their project.
      return await this.ctx._request(
        'delete',
        `/kubernetes/apis/project.openshift.io/v1/projects/${name}`,
      );
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      if (isNotFoundMessage(msg)) {
        return null;
      }
      if (!isForbiddenMessage(msg)) {
        throw error;
      }
    }

    try {
      return await this.ctx._request('delete', `/kubernetes/api/v1/namespaces/${name}`);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      if (isNotFoundMessage(msg)) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Ensure a project/namespace exists.
   * Non-priv (CNV-98979): OpenShift returns 403 (not 404) for unknown projects;
   * create via projectrequests, then grant admin via kubeadmin oc when available.
   */
  async ensureNamespace(name: string, nonPriv = EnvVariables.isNonPrivUser): Promise<void> {
    const exists = await this.namespaceExists(name);
    if (!exists) {
      await this.createNamespaceAsCurrentUserOrOc(name);
    }
    if (nonPriv && canRunOc()) {
      this.grantNonPrivAdmin(name);
      ensureDiskUploaderNamespaceRbac(name, resolveKubeconfig());
      await new Promise((resolve) => setTimeout(resolve, 2 * SECOND));
    }
  }

  getNamespace(name: string): Promise<KubernetesResource | null> {
    return this.ctx.getResource('', 'v1', 'namespaces', name);
  }

  getPods(namespace: string): Promise<KubernetesListResource> {
    return this.ctx.listResources('', 'v1', 'pods', namespace);
  }

  listNamespaces(labelSelector?: string): Promise<KubernetesListResource> {
    const queryParams = labelSelector ? { labelSelector } : undefined;
    return this.ctx.listResources('', 'v1', 'namespaces', undefined, queryParams);
  }

  /**
   * Existence check that works for non-priv on OpenShift 4.x:
   * unknown projects return Forbidden (not NotFound) — treat as absent.
   */
  async namespaceExists(name: string): Promise<boolean> {
    try {
      const project = await this.ctx._request(
        'get',
        `/kubernetes/apis/project.openshift.io/v1/projects/${name}`,
      );
      return project !== null;
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      if (isNotFoundMessage(msg) || isForbiddenMessage(msg)) {
        // 403 on unknown projects is expected for non-priv (does not leak existence).
        return false;
      }
      throw error;
    }
  }

  async setupTestNamespace(namespace: string): Promise<void> {
    logger.info(`Ensuring test namespace "${namespace}" exists...`);
    await this.ensureNamespace(namespace);
  }

  async waitForNamespaceReady(name: string, timeoutMs = 30000): Promise<boolean> {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      try {
        // Prefer Project API so non-priv sessions work after they own the project.
        const ns = await this.ctx._request(
          'get',
          `/kubernetes/apis/project.openshift.io/v1/projects/${name}`,
        );
        const phase = (ns?.status as Record<string, unknown>)?.phase;
        if (phase === 'Active' || ns) {
          return true;
        }
      } catch {
        // Namespace may not exist yet
      }
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
    return false;
  }

  async waitForPodReady(namespace: string, podName: string, timeoutMs = 60000): Promise<boolean> {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      try {
        const pod = await this.ctx.getResource('', 'v1', 'pods', podName, namespace);
        const conditions = (pod?.status as Record<string, unknown>)?.conditions as
          | Array<{ type: string; status: string }>
          | undefined;
        const ready = conditions?.find((c) => c.type === 'Ready');
        if (ready?.status === 'True') {
          return true;
        }
      } catch {
        // Pod may not exist yet
      }
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
    return false;
  }

  private async createNamespaceAsCurrentUserOrOc(name: string): Promise<void> {
    try {
      await this.createProject(name);
      return;
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      if (!isForbiddenMessage(msg) || !canRunOc()) {
        throw error;
      }
      logger.warn(
        `Console project create forbidden for "${name}" — falling back to kubeadmin oc (CNV-98979)`,
      );
    }

    const kubeconfig = resolveKubeconfig();
    try {
      runOcCommand(`oc get project ${name}`, kubeconfig, 30 * SECOND);
    } catch {
      runOcCommand(`oc new-project ${name} --display-name="${name}"`, kubeconfig);
    }
  }

  private grantNonPrivAdmin(name: string): void {
    const kubeconfig = resolveKubeconfig();
    const username = EnvVariables.testUsername;
    try {
      runOcCommand(`oc adm policy add-role-to-user admin ${username} -n ${name}`, kubeconfig);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      logger.warn(`Could not grant admin on ${name} to "${username}": ${msg}`);
    }
  }
}
