import { createHash } from 'crypto';

import type { KubernetesListResource, KubernetesResource } from '@/data-models/kubernetes-types';
import { getErrorMessage } from '@/data-models/kubernetes-types';
import { EnvVariables } from '@/utils/env-variables';
import { TestTimeouts } from '@/utils/test-config';
import type * as k8s from '@kubernetes/client-node';

import { getKubernetesProxyUrl, makeKubernetesProxyRequest } from '../kubernetes-proxy';

import type { KubernetesHandlerContext } from './kubernetes-api-context';
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

export class NamespaceHandler {
  constructor(
    private readonly ctx: KubernetesHandlerContext,
    private readonly secret: SecretConfigMapHandler,
    private readonly vm: VirtualMachineHandler,
  ) {}

  /** Returns the htpasswd credential username for the non-priv test user (TEST_USERNAME env, default "test"). */
  private _nonPrivUsername(): string {
    return EnvVariables.testUsername;
  }

  private isAlreadyExistsK8sError(error: unknown): boolean {
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

  private isNotFoundK8sError(error: unknown): boolean {
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

  private isSystemNamespaceExcludedForTestUser(namespace: string): boolean {
    return namespace === 'default' || namespace.startsWith('openshift-');
  }

  private parseQuantityToBytes(q: string | undefined): number {
    if (!q || typeof q !== 'string') return 0;
    const s = q.trim();
    const match = s.match(/^(\d+(?:\.\d+)?)\s*([KMGTPE]i?)?$/);
    if (!match) return 0;
    const num = parseFloat(match[1]);
    const unit = (match[2] || '').toLowerCase();
    if (unit === 'ki') return num * 1024;
    if (unit === 'mi') return num * 1024 ** 2;
    if (unit === 'gi') return num * 1024 ** 3;
    if (unit === 'ti') return num * 1024 ** 4;
    if (unit === 'pi') return num * 1024 ** 5;
    if (unit === 'ei') return num * 1024 ** 6;
    if (unit === 'k') return num * 1000;
    if (unit === 'm') return num * 1000 ** 2;
    if (unit === 'g') return num * 1000 ** 3;
    if (unit === 't') return num * 1000 ** 4;
    if (unit === 'p') return num * 1000 ** 5;
    if (unit === 'e') return num * 1000 ** 6;
    return num;
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

  /**
   * Deletes a ClusterRoleBinding by name. 404 is silently ignored so teardown
   * is safe to call even if the binding was never created.
   */
  async deleteClusterRoleBinding(name: string): Promise<void> {
    try {
      await this.ctx.rbacApi.deleteClusterRoleBinding({ name });
    } catch (error: unknown) {
      const msg = getErrorMessage(error);
      if (msg.includes('404') || msg.includes('not found')) {
        return;
      }
      throw new Error(`Failed to delete ClusterRoleBinding "${name}": ${msg}`);
    }
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

  /**
   * Ensures RBAC for network latency checkup tests.
   *
   */
  async ensureNetworkCheckupPermissions(namespace: string): Promise<{
    results: Record<string, { created: boolean; alreadyExisted: boolean }>;
    anyCreated: boolean;
  }> {
    const saName = 'vm-latency-checkup-sa';
    const latencyRoleName = 'kubevirt-vm-latency-checker';
    const configmapRoleName = 'kiagnose-configmap-access';

    const latencyRules = [
      {
        apiGroups: ['kubevirt.io'],
        resources: ['virtualmachineinstances'],
        verbs: ['get', 'create', 'delete'],
      },
      {
        apiGroups: ['subresources.kubevirt.io'],
        resources: ['virtualmachineinstances/console'],
        verbs: ['get'],
      },
      {
        apiGroups: ['k8s.cni.cncf.io'],
        resources: ['network-attachment-definitions'],
        verbs: ['get'],
      },
    ];

    const configmapRules = [
      { apiGroups: [''], resources: ['configmaps'], verbs: ['get', 'update'] },
    ];

    const results: Record<string, { created: boolean; alreadyExisted: boolean }> = {};
    const rbacGroup = 'rbac.authorization.k8s.io';
    const rbacVersion = 'v1';

    try {
      await this.ctx.coreV1Api.readNamespacedServiceAccount({ name: saName, namespace });
      results.serviceAccount = { created: false, alreadyExisted: true };
    } catch (error: unknown) {
      if (this.isNotFoundK8sError(error)) {
        try {
          await this.ctx.coreV1Api.createNamespacedServiceAccount({
            namespace,
            body: {
              apiVersion: 'v1',
              kind: 'ServiceAccount',
              metadata: { name: saName, namespace },
            },
          });
          results.serviceAccount = { created: true, alreadyExisted: false };
        } catch (createError: unknown) {
          if (this.isAlreadyExistsK8sError(createError)) {
            results.serviceAccount = { created: false, alreadyExisted: true };
          } else {
            throw createError;
          }
        }
      } else {
        throw error;
      }
    }

    try {
      await this.ctx.getCustomResource(rbacGroup, rbacVersion, namespace, 'roles', latencyRoleName);
      results.latencyRole = { created: false, alreadyExisted: true };
    } catch (error: unknown) {
      if (this.isNotFoundK8sError(error)) {
        try {
          await this.ctx.createCustomResource(rbacGroup, rbacVersion, namespace, 'roles', {
            apiVersion: `${rbacGroup}/${rbacVersion}`,
            kind: 'Role',
            metadata: { name: latencyRoleName, namespace },
            rules: latencyRules,
          });
          results.latencyRole = { created: true, alreadyExisted: false };
        } catch (createError: unknown) {
          if (this.isAlreadyExistsK8sError(createError)) {
            results.latencyRole = { created: false, alreadyExisted: true };
          } else {
            throw createError;
          }
        }
      } else {
        throw error;
      }
    }

    try {
      await this.ctx.getCustomResource(
        rbacGroup,
        rbacVersion,
        namespace,
        'rolebindings',
        latencyRoleName,
      );
      results.latencyRoleBinding = { created: false, alreadyExisted: true };
    } catch (error: unknown) {
      if (this.isNotFoundK8sError(error)) {
        try {
          await this.ctx.createCustomResource(rbacGroup, rbacVersion, namespace, 'rolebindings', {
            apiVersion: `${rbacGroup}/${rbacVersion}`,
            kind: 'RoleBinding',
            metadata: { name: latencyRoleName, namespace },
            subjects: [{ kind: 'ServiceAccount', name: saName, namespace }],
            roleRef: { apiGroup: rbacGroup, kind: 'Role', name: latencyRoleName },
          });
          results.latencyRoleBinding = { created: true, alreadyExisted: false };
        } catch (createError: unknown) {
          if (this.isAlreadyExistsK8sError(createError)) {
            results.latencyRoleBinding = { created: false, alreadyExisted: true };
          } else {
            throw createError;
          }
        }
      } else {
        throw error;
      }
    }

    try {
      await this.ctx.getCustomResource(
        rbacGroup,
        rbacVersion,
        namespace,
        'roles',
        configmapRoleName,
      );
      results.configmapRole = { created: false, alreadyExisted: true };
    } catch (error: unknown) {
      if (this.isNotFoundK8sError(error)) {
        try {
          await this.ctx.createCustomResource(rbacGroup, rbacVersion, namespace, 'roles', {
            apiVersion: `${rbacGroup}/${rbacVersion}`,
            kind: 'Role',
            metadata: { name: configmapRoleName, namespace },
            rules: configmapRules,
          });
          results.configmapRole = { created: true, alreadyExisted: false };
        } catch (createError: unknown) {
          if (this.isAlreadyExistsK8sError(createError)) {
            results.configmapRole = { created: false, alreadyExisted: true };
          } else {
            throw createError;
          }
        }
      } else {
        throw error;
      }
    }

    try {
      await this.ctx.getCustomResource(
        rbacGroup,
        rbacVersion,
        namespace,
        'rolebindings',
        configmapRoleName,
      );
      results.configmapRoleBinding = { created: false, alreadyExisted: true };
    } catch (error: unknown) {
      if (this.isNotFoundK8sError(error)) {
        try {
          await this.ctx.createCustomResource(rbacGroup, rbacVersion, namespace, 'rolebindings', {
            apiVersion: `${rbacGroup}/${rbacVersion}`,
            kind: 'RoleBinding',
            metadata: { name: configmapRoleName, namespace },
            subjects: [{ kind: 'ServiceAccount', name: saName, namespace }],
            roleRef: { apiGroup: rbacGroup, kind: 'Role', name: configmapRoleName },
          });
          results.configmapRoleBinding = { created: true, alreadyExisted: false };
        } catch (createError: unknown) {
          if (this.isAlreadyExistsK8sError(createError)) {
            results.configmapRoleBinding = { created: false, alreadyExisted: true };
          } else {
            throw createError;
          }
        }
      } else {
        throw error;
      }
    }

    try {
      await this.ctx.getClusterCustomResource(
        rbacGroup,
        rbacVersion,
        'clusterroles',
        latencyRoleName,
      );
      results.latencyClusterRole = { created: false, alreadyExisted: true };
    } catch (error: unknown) {
      if (this.isNotFoundK8sError(error)) {
        try {
          await this.ctx.createClusterCustomResource(rbacGroup, rbacVersion, 'clusterroles', {
            apiVersion: `${rbacGroup}/${rbacVersion}`,
            kind: 'ClusterRole',
            metadata: { name: latencyRoleName },
            rules: latencyRules,
          });
          results.latencyClusterRole = { created: true, alreadyExisted: false };
        } catch (createError: unknown) {
          if (this.isAlreadyExistsK8sError(createError)) {
            results.latencyClusterRole = { created: false, alreadyExisted: true };
          } else {
            throw createError;
          }
        }
      } else {
        throw error;
      }
    }

    try {
      await this.ctx.getClusterCustomResource(
        rbacGroup,
        rbacVersion,
        'clusterrolebindings',
        latencyRoleName,
      );
      results.latencyClusterRoleBinding = { created: false, alreadyExisted: true };
    } catch (error: unknown) {
      if (this.isNotFoundK8sError(error)) {
        try {
          await this.ctx.createClusterCustomResource(
            rbacGroup,
            rbacVersion,
            'clusterrolebindings',
            {
              apiVersion: `${rbacGroup}/${rbacVersion}`,
              kind: 'ClusterRoleBinding',
              metadata: { name: latencyRoleName },
              subjects: [
                {
                  kind: 'ServiceAccount',
                  name: saName,
                  namespace,
                },
              ],
              roleRef: { apiGroup: rbacGroup, kind: 'ClusterRole', name: latencyRoleName },
            },
          );
          results.latencyClusterRoleBinding = { created: true, alreadyExisted: false };
        } catch (createError: unknown) {
          if (this.isAlreadyExistsK8sError(createError)) {
            results.latencyClusterRoleBinding = { created: false, alreadyExisted: true };
          } else {
            throw createError;
          }
        }
      } else {
        throw error;
      }
    }

    try {
      await this.ctx.getClusterCustomResource(
        rbacGroup,
        rbacVersion,
        'clusterroles',
        configmapRoleName,
      );
      results.configmapClusterRole = { created: false, alreadyExisted: true };
    } catch (error: unknown) {
      if (this.isNotFoundK8sError(error)) {
        try {
          await this.ctx.createClusterCustomResource(rbacGroup, rbacVersion, 'clusterroles', {
            apiVersion: `${rbacGroup}/${rbacVersion}`,
            kind: 'ClusterRole',
            metadata: { name: configmapRoleName },
            rules: configmapRules,
          });
          results.configmapClusterRole = { created: true, alreadyExisted: false };
        } catch (createError: unknown) {
          if (this.isAlreadyExistsK8sError(createError)) {
            results.configmapClusterRole = { created: false, alreadyExisted: true };
          } else {
            throw createError;
          }
        }
      } else {
        throw error;
      }
    }

    try {
      await this.ctx.getClusterCustomResource(
        rbacGroup,
        rbacVersion,
        'clusterrolebindings',
        configmapRoleName,
      );
      results.configmapClusterRoleBinding = { created: false, alreadyExisted: true };
    } catch (error: unknown) {
      if (this.isNotFoundK8sError(error)) {
        try {
          await this.ctx.createClusterCustomResource(
            rbacGroup,
            rbacVersion,
            'clusterrolebindings',
            {
              apiVersion: `${rbacGroup}/${rbacVersion}`,
              kind: 'ClusterRoleBinding',
              metadata: { name: configmapRoleName },
              subjects: [
                {
                  kind: 'ServiceAccount',
                  name: saName,
                  namespace,
                },
              ],
              roleRef: { apiGroup: rbacGroup, kind: 'ClusterRole', name: configmapRoleName },
            },
          );
          results.configmapClusterRoleBinding = { created: true, alreadyExisted: false };
        } catch (createError: unknown) {
          if (this.isAlreadyExistsK8sError(createError)) {
            results.configmapClusterRoleBinding = { created: false, alreadyExisted: true };
          } else {
            throw createError;
          }
        }
      } else {
        throw error;
      }
    }

    const anyCreated = Object.values(results).some((r) => r.created);
    return { results, anyCreated };
  }

  /**
   * Ensures the non-privileged test user exists in the cluster's htpasswd identity provider.
   *
   * Strategy:
   *   1. Check for a Secret named `htpasswd-secret` in `openshift-config`.
   *   2. If found, decode the existing htpasswd data; skip if the username is already present,
   *      otherwise append the bcrypt hash for the new password and patch the secret.
   *   3. If not found, create the secret and add/patch the HTPasswd IDP entry on the
   *      `OAuth` cluster custom resource.
   *
   * Idempotent: repeated calls with the same username are safe (no-op if user already present).
   * Uses a pure-Node bcrypt implementation to avoid a dependency on the `htpasswd` CLI binary.
   */
  /**
   * Returns `true` if a user entry or OAuth IDP was newly created (triggering
   * OAuth pod rollout), or `false` if everything was already in place.
   */
  async ensureNonPrivUserExists(username: string, password = 'test'): Promise<boolean> {
    const SECRET_NAME = 'htpasswd-secret';
    const SECRET_NS = 'openshift-config';
    const IDP_NAME = 'test-users';

    // --- 1. Generate a SHA-1 htpasswd entry using Node.js built-in crypto ---
    // OpenShift OAuth accepts the {SHA} scheme (RFC 2307 LDAP password format).
    // This avoids any dependency on the htpasswd CLI (httpd-tools), which is not
    // installed on all hosts (e.g. fresh RHEL/Fedora, macOS, minimal containers).
    // Format: username:{SHA}base64(sha1(password))
    const sha1Hash = createHash('sha1').update(password).digest('base64');
    const newEntry = `${username}:{SHA}${sha1Hash}`;

    // --- 2. Read the existing secret (if any) ---
    // Any error here (including 404 returned as a string body) means the secret
    // does not exist yet — fall through to create it.
    let existingData: string | undefined;
    try {
      const secret = unwrapApiBody<{ data?: Record<string, string> }>(
        await this.ctx.coreV1Api.readNamespacedSecret({ name: SECRET_NAME, namespace: SECRET_NS }),
      );
      existingData = secret?.data?.htpasswd
        ? Buffer.from(secret.data.htpasswd, 'base64').toString('utf8')
        : undefined;
    } catch {
      // Secret does not exist or is unreadable — proceed to create it below.
    }

    if (existingData !== undefined) {
      const lines = existingData.split('\n');
      const existingLineIndex = lines.findIndex((line) => line.startsWith(`${username}:`));

      let updatedContent: string;
      if (existingLineIndex !== -1) {
        // User exists — replace the line to ensure the expected password hash is current.
        // This fixes stale hashes on clusters where the user was created with a different password.
        lines[existingLineIndex] = newEntry;
        updatedContent = lines.join('\n').trimEnd() + '\n';
      } else {
        // User not in file — append the new entry.
        updatedContent = existingData.trimEnd() + '\n' + newEntry + '\n';
      }

      const encoded = Buffer.from(updatedContent).toString('base64');
      try {
        // The k8s client library defaults to application/json-patch+json — use JSON Patch ops
        // to replace only the htpasswd data field so the content type matches the body format.
        await this.ctx.coreV1Api.patchNamespacedSecret({
          name: SECRET_NAME,
          namespace: SECRET_NS,
          body: [{ op: 'replace', path: '/data/htpasswd', value: encoded }],
        });
      } catch (patchError: unknown) {
        throw new Error(`Failed to patch htpasswd secret: ${getErrorMessage(patchError)}`);
      }
    } else {
      // --- 3. Secret does not exist — create it ---
      const encoded = Buffer.from(newEntry + '\n').toString('base64');
      try {
        await this.ctx.coreV1Api.createNamespacedSecret({
          namespace: SECRET_NS,
          body: {
            apiVersion: 'v1',
            kind: 'Secret',
            metadata: { name: SECRET_NAME, namespace: SECRET_NS },
            data: { htpasswd: encoded },
          },
        });
      } catch (createError: unknown) {
        const e = asK8sClientError(createError);
        const msg = getErrorMessage(createError);
        if (e.statusCode !== 409 && e.body?.code !== 409 && !msg.includes('already exists')) {
          throw new Error(`Failed to create htpasswd secret: ${msg}`);
        }
      }
    }

    // --- 4. Ensure the OAuth cluster resource has the HTPasswd IDP entry ---
    // Always checked: the secret may have been created in a previous run but the OAuth
    // CR patch may have failed (e.g. 400 from a stale client content-type bug).
    try {
      const oauth = unwrapApiBody<{
        spec?: { identityProviders?: Array<{ name: string; type: string; htpasswd?: unknown }> };
      }>(
        await this.ctx.customObjectsApi.getClusterCustomObject({
          group: 'config.openshift.io',
          version: 'v1',
          plural: 'oauths',
          name: 'cluster',
        }),
      );

      const idps: Array<{ name: string; type: string; htpasswd?: unknown }> =
        oauth?.spec?.identityProviders ?? [];
      const hasIdp = idps.some((idp) => idp.name === IDP_NAME && idp.type === 'HTPasswd');

      if (!hasIdp) {
        idps.push({
          name: IDP_NAME,
          type: 'HTPasswd',
          htpasswd: { fileData: { name: SECRET_NAME } },
        });

        // The library defaults to application/json-patch+json, so send JSON Patch ops.
        // Use 'replace' when identityProviders already existed, 'add' when it did not.
        const patchOp = oauth?.spec?.identityProviders !== undefined ? 'replace' : 'add';
        await this.ctx.customObjectsApi.patchClusterCustomObject({
          group: 'config.openshift.io',
          version: 'v1',
          plural: 'oauths',
          name: 'cluster',
          body: [{ op: patchOp, path: '/spec/identityProviders', value: idps }],
        });
      }
    } catch (oauthError: unknown) {
      // OAuth patching is best-effort — if the IDP already exists via another mechanism
      // (e.g. cluster was already configured), the login will still work.
      const msg = getErrorMessage(oauthError);
      // Re-throw only for unexpected errors; ignore "not found" (test env may not have OAuth CR)
      const e = asK8sClientError(oauthError);
      if (e.statusCode !== 404 && e.body?.code !== 404) {
        throw new Error(`Failed to patch OAuth cluster resource: ${msg}`);
      }
    }

    // --- 5. Remove stale Identity/User objects that map the username to a different IDP ---
    // When a cluster is re-used after an IDP rename (e.g. "test" → "test-users"), OpenShift
    // rejects login with "user cannot be claimed by identity X because it is mapped to Y".
    // Delete any Identity for this username that does NOT match the current IDP_NAME so the
    // user object is recreated with the correct mapping on next login.
    try {
      const expectedIdentityPrefix = `${IDP_NAME}:${username}`;
      const identitiesResponse = unwrapApiBody<{
        items?: Array<{ metadata?: { name?: string }; user?: { name?: string } }>;
      }>(
        await this.ctx.customObjectsApi.listClusterCustomObject({
          group: 'user.openshift.io',
          version: 'v1',
          plural: 'identities',
        }),
      );
      const staleIdentities = (identitiesResponse?.items ?? []).filter(
        (id) =>
          id.user?.name === username &&
          id.metadata?.name !== undefined &&
          id.metadata.name !== expectedIdentityPrefix,
      );
      for (const staleId of staleIdentities) {
        const idName = staleId.metadata?.name;
        if (!idName) continue;
        await this.ctx.customObjectsApi
          .deleteClusterCustomObject({
            group: 'user.openshift.io',
            version: 'v1',
            plural: 'identities',
            name: idName,
          })
          .catch(() => undefined);
        // Also delete the User object so it is recreated with the correct identity on next login.
        await this.ctx.customObjectsApi
          .deleteClusterCustomObject({
            group: 'user.openshift.io',
            version: 'v1',
            plural: 'users',
            name: username,
          })
          .catch(() => undefined);
      }
    } catch {
      // Best-effort — if identity cleanup fails the login attempt will still surface the error.
    }

    return true;
  }

  /**
   * Creates an OVN layer2 NAD if missing.
   */
  async ensureOvnNadExists(
    nadName: string,
    namespace: string,
  ): Promise<{
    created: boolean;
    alreadyExisted: boolean;
  }> {
    const group = 'k8s.cni.cncf.io';
    const version = 'v1';
    const plural = 'network-attachment-definitions';

    try {
      await this.ctx.getCustomResource(group, version, namespace, plural, nadName);
      return { created: false, alreadyExisted: true };
    } catch (error: unknown) {
      if (this.isNotFoundK8sError(error)) {
        const nadResource = {
          apiVersion: `${group}/${version}`,
          kind: 'NetworkAttachmentDefinition',
          metadata: {
            name: nadName,
            namespace,
            labels: {
              'app.kubernetes.io/managed-by': 'playwright-test',
            },
          },
          spec: {
            config: JSON.stringify({
              cniVersion: '0.3.1',
              type: 'ovn-k8s-cni-overlay',
              topology: 'layer2',
              netAttachDefName: `${namespace}/${nadName}`,
            }),
          },
        };
        try {
          await this.ctx.createCustomResource(group, version, namespace, plural, nadResource);
          return { created: true, alreadyExisted: false };
        } catch (createError: unknown) {
          if (this.isAlreadyExistsK8sError(createError)) {
            return { created: false, alreadyExisted: true };
          }
          throw createError;
        }
      }
      throw error;
    }
  }

  /**
   * Ensures ServiceAccount, Role, RoleBinding, and ClusterRoleBinding required for storage checkup tests.
   *
   */
  async ensureStorageCheckupPermissions(namespace: string): Promise<{
    results: Record<string, { created: boolean; alreadyExisted: boolean }>;
    anyCreated: boolean;
  }> {
    const saName = 'storage-checkup-sa';
    const roleName = 'storage-checkup-role';
    const clusterRoleBindingName = 'kubevirt-storage-checkup-clustereader';

    const storageRules = [
      { apiGroups: [''], resources: ['configmaps'], verbs: ['get', 'update'] },
      {
        apiGroups: ['kubevirt.io'],
        resources: ['virtualmachines'],
        verbs: ['create', 'delete'],
      },
      { apiGroups: ['kubevirt.io'], resources: ['virtualmachineinstances'], verbs: ['get'] },
      {
        apiGroups: ['subresources.kubevirt.io'],
        resources: ['virtualmachineinstances/addvolume', 'virtualmachineinstances/removevolume'],
        verbs: ['update'],
      },
      {
        apiGroups: ['kubevirt.io'],
        resources: ['virtualmachineinstancemigrations'],
        verbs: ['create'],
      },
      {
        apiGroups: ['cdi.kubevirt.io'],
        resources: ['datavolumes'],
        verbs: ['create', 'delete'],
      },
      { apiGroups: [''], resources: ['persistentvolumeclaims'], verbs: ['delete'] },
    ];

    const results: Record<string, { created: boolean; alreadyExisted: boolean }> = {};

    try {
      await this.ctx.coreV1Api.readNamespacedServiceAccount({ name: saName, namespace });
      results.serviceAccount = { created: false, alreadyExisted: true };
    } catch (error: unknown) {
      if (this.isNotFoundK8sError(error)) {
        try {
          await this.ctx.coreV1Api.createNamespacedServiceAccount({
            namespace,
            body: {
              apiVersion: 'v1',
              kind: 'ServiceAccount',
              metadata: { name: saName, namespace },
            },
          });
          results.serviceAccount = { created: true, alreadyExisted: false };
        } catch (createError: unknown) {
          if (this.isAlreadyExistsK8sError(createError)) {
            results.serviceAccount = { created: false, alreadyExisted: true };
          } else {
            throw createError;
          }
        }
      } else {
        throw error;
      }
    }

    const rbacGroup = 'rbac.authorization.k8s.io';
    const rbacVersion = 'v1';

    try {
      await this.ctx.getCustomResource(rbacGroup, rbacVersion, namespace, 'roles', roleName);
      results.role = { created: false, alreadyExisted: true };
    } catch (error: unknown) {
      if (this.isNotFoundK8sError(error)) {
        try {
          await this.ctx.createCustomResource(rbacGroup, rbacVersion, namespace, 'roles', {
            apiVersion: `${rbacGroup}/${rbacVersion}`,
            kind: 'Role',
            metadata: { name: roleName, namespace },
            rules: storageRules,
          });
          results.role = { created: true, alreadyExisted: false };
        } catch (createError: unknown) {
          if (this.isAlreadyExistsK8sError(createError)) {
            results.role = { created: false, alreadyExisted: true };
          } else {
            throw createError;
          }
        }
      } else {
        throw error;
      }
    }

    try {
      await this.ctx.getCustomResource(rbacGroup, rbacVersion, namespace, 'rolebindings', roleName);
      results.roleBinding = { created: false, alreadyExisted: true };
    } catch (error: unknown) {
      if (this.isNotFoundK8sError(error)) {
        try {
          await this.ctx.createCustomResource(rbacGroup, rbacVersion, namespace, 'rolebindings', {
            apiVersion: `${rbacGroup}/${rbacVersion}`,
            kind: 'RoleBinding',
            metadata: { name: roleName, namespace },
            subjects: [{ kind: 'ServiceAccount', name: saName, namespace }],
            roleRef: { apiGroup: rbacGroup, kind: 'Role', name: roleName },
          });
          results.roleBinding = { created: true, alreadyExisted: false };
        } catch (createError: unknown) {
          if (this.isAlreadyExistsK8sError(createError)) {
            results.roleBinding = { created: false, alreadyExisted: true };
          } else {
            throw createError;
          }
        }
      } else {
        throw error;
      }
    }

    try {
      await this.ctx.getClusterCustomResource(
        rbacGroup,
        rbacVersion,
        'clusterrolebindings',
        clusterRoleBindingName,
      );
      results.clusterRoleBinding = { created: false, alreadyExisted: true };
    } catch (error: unknown) {
      if (this.isNotFoundK8sError(error)) {
        try {
          await this.ctx.createClusterCustomResource(
            rbacGroup,
            rbacVersion,
            'clusterrolebindings',
            {
              apiVersion: `${rbacGroup}/${rbacVersion}`,
              kind: 'ClusterRoleBinding',
              metadata: { name: clusterRoleBindingName },
              subjects: [
                {
                  kind: 'ServiceAccount',
                  name: saName,
                  namespace,
                },
              ],
              roleRef: { apiGroup: rbacGroup, kind: 'ClusterRole', name: 'cluster-reader' },
            },
          );
          results.clusterRoleBinding = { created: true, alreadyExisted: false };
        } catch (createError: unknown) {
          if (this.isAlreadyExistsK8sError(createError)) {
            results.clusterRoleBinding = { created: false, alreadyExisted: true };
          } else {
            throw createError;
          }
        }
      } else {
        throw error;
      }
    }

    const anyCreated = Object.values(results).some((r) => r.created);
    return { results, anyCreated };
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

  /** Expected resource allocation for VM Overview cards (running VMI count, vCPU, memory MiB, storage GiB). */
  async getNamespaceResourceAllocationForOverview(namespace: string): Promise<{
    runningCount: number;
    vcpu: number;
    memoryMiB: number;
    storageGiB: number;
  }> {
    const vmis = (await this.ctx.listCustomResources(
      'kubevirt.io',
      'v1',
      namespace,
      'virtualmachineinstances',
    )) as KubernetesResource[];
    const running = vmis.filter(
      (v) => (v.status as { phase?: string } | undefined)?.phase === 'Running',
    );
    let vcpu = 0;
    let memoryBytes = 0;
    for (const vmi of running) {
      const spec = vmi.spec as
        | {
            domain?: {
              cpu?: { sockets?: number; cores?: number };
              memory?: { guest?: string };
            };
          }
        | undefined;
      const cpu = spec?.domain?.cpu;
      const sockets = cpu?.sockets ?? 1;
      const cores = cpu?.cores ?? 1;
      vcpu += sockets * cores;
      const mem = spec?.domain?.memory?.guest;
      memoryBytes += this.parseQuantityToBytes(mem);
    }
    const memoryMiB = memoryBytes / 1024 / 1024;

    const dvs = (await this.ctx.listCustomResources(
      'cdi.kubevirt.io',
      'v1beta1',
      namespace,
      'datavolumes',
    )) as KubernetesResource[];
    let storageBytes = 0;
    for (const dv of dvs) {
      const spec = dv.spec as
        | { pvc?: { resources?: { requests?: { storage?: string } } } }
        | undefined;
      const req = spec?.pvc?.resources?.requests?.storage;
      storageBytes += this.parseQuantityToBytes(req);
    }
    const storageGiB = storageBytes / 1024 / 1024 / 1024;

    return {
      runningCount: running.length,
      vcpu,
      memoryMiB,
      storageGiB,
    };
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

  async getPods(namespace: string) {
    try {
      const response = await this.ctx.coreV1Api.listNamespacedPod({ namespace });
      return response.items || [];
    } catch (error: unknown) {
      throw new Error(`Failed to get pods in namespace ${namespace}: ${getErrorMessage(error)}`);
    }
  }

  async grantUserAccessToNamespace(namespace: string, username: string): Promise<void> {
    if (this.isSystemNamespaceExcludedForTestUser(namespace)) {
      return;
    }
    const bindingName = 'test-user-admin';
    try {
      const roleBinding: k8s.V1RoleBinding = {
        apiVersion: 'rbac.authorization.k8s.io/v1',
        kind: 'RoleBinding',
        metadata: {
          name: bindingName,
          namespace,
        },
        roleRef: {
          apiGroup: 'rbac.authorization.k8s.io',
          kind: 'ClusterRole',
          name: 'admin',
        },
        subjects: [
          {
            apiGroup: 'rbac.authorization.k8s.io',
            kind: 'User',
            name: username,
          },
        ],
      };
      await this.ctx.rbacApi.createNamespacedRoleBinding({ namespace, body: roleBinding });
    } catch (error: unknown) {
      const e = asK8sClientError(error);
      const msg = getErrorMessage(error);
      if (
        e.statusCode === 409 ||
        e.code === 409 ||
        e.body?.code === 409 ||
        msg.includes('409') ||
        msg.includes('already exists')
      ) {
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
          const newSubject = {
            apiGroup: 'rbac.authorization.k8s.io' as const,
            kind: 'User' as const,
            name: username,
          };
          // The k8s client library defaults to application/json-patch+json — use JSON Patch ops.
          await this.ctx.rbacApi.patchNamespacedRoleBinding({
            name: bindingName,
            namespace,
            body: [{ op: 'replace', path: '/subjects', value: [...subjects, newSubject] }],
          });
        } catch (patchError: unknown) {
          throw new Error(
            `Failed to add user ${username} to RoleBinding in namespace ${namespace}: ${getErrorMessage(
              patchError,
            )}`,
          );
        }
      } else {
        throw new Error(
          `Failed to grant user ${username} access to namespace ${namespace}: ${msg}`,
        );
      }
    }
  }

  /**
   * Grants the non-priv test user cluster-wide read access to CDI resources
   * (datasources, datavolumes, dataimportcrons, datavolumes/source).
   *
   * The built-in `view` ClusterRole does not cover CDI custom resources, so the
   * Bootable Volumes page returns 403 for non-priv users without this grant.
   * A dedicated ClusterRole + ClusterRoleBinding is created idempotently.
   */
  async grantUserCdiClusterReadAccess(username: string): Promise<void> {
    const roleName = 'test-user-cdi-reader';
    const bindingName = `test-user-cdi-reader-${username
      .replace(/[^a-z0-9]/gi, '-')
      .toLowerCase()}`;

    // Ensure the ClusterRole exists (idempotent)
    try {
      await this.ctx.rbacApi.createClusterRole({
        body: {
          apiVersion: 'rbac.authorization.k8s.io/v1',
          kind: 'ClusterRole',
          metadata: { name: roleName },
          rules: [
            {
              apiGroups: ['cdi.kubevirt.io'],
              resources: ['datasources', 'datavolumes', 'dataimportcrons', 'cdiconfigs'],
              verbs: ['get', 'list', 'watch'],
            },
          ],
        },
      });
    } catch (error: unknown) {
      const e = asK8sClientError(error);
      const msg = getErrorMessage(error);
      if (
        e.statusCode !== 409 &&
        e.code !== 409 &&
        e.body?.code !== 409 &&
        !msg.includes('already exists')
      ) {
        throw new Error(`Failed to create CDI reader ClusterRole: ${msg}`);
      }
    }

    // Bind the ClusterRole to the user (idempotent)
    try {
      await this.ctx.rbacApi.createClusterRoleBinding({
        body: {
          apiVersion: 'rbac.authorization.k8s.io/v1',
          kind: 'ClusterRoleBinding',
          metadata: { name: bindingName },
          roleRef: {
            apiGroup: 'rbac.authorization.k8s.io',
            kind: 'ClusterRole',
            name: roleName,
          },
          subjects: [
            {
              apiGroup: 'rbac.authorization.k8s.io',
              kind: 'User',
              name: username,
            },
          ],
        },
      });
    } catch (error: unknown) {
      const e = asK8sClientError(error);
      const msg = getErrorMessage(error);
      if (
        e.statusCode !== 409 &&
        e.code !== 409 &&
        e.body?.code !== 409 &&
        !msg.includes('already exists')
      ) {
        throw new Error(`Failed to grant CDI cluster read access for user ${username}: ${msg}`);
      }
    }
  }

  /**
   * Grants the test user a cluster-level ClusterRoleBinding for the `view` ClusterRole.
   * This gives the non-priv user read access to resources across all namespaces,
   * enabling access to the VM creation wizard catalog, templates, bootable volumes, and
   * overview widgets that query cluster-wide resources.
   *
   * The binding name is deterministic so repeated calls are idempotent (409 → skip).
   */
  async grantUserClusterViewAccess(username: string): Promise<void> {
    const bindingName = `test-user-cluster-view-${username
      .replace(/[^a-z0-9]/gi, '-')
      .toLowerCase()}`;
    try {
      const clusterRoleBinding: k8s.V1ClusterRoleBinding = {
        apiVersion: 'rbac.authorization.k8s.io/v1',
        kind: 'ClusterRoleBinding',
        metadata: { name: bindingName },
        roleRef: {
          apiGroup: 'rbac.authorization.k8s.io',
          kind: 'ClusterRole',
          name: 'view',
        },
        subjects: [
          {
            apiGroup: 'rbac.authorization.k8s.io',
            kind: 'User',
            name: username,
          },
        ],
      };
      await this.ctx.rbacApi.createClusterRoleBinding({ body: clusterRoleBinding });
    } catch (error: unknown) {
      const e = asK8sClientError(error);
      const msg = getErrorMessage(error);
      if (
        e.statusCode === 409 ||
        e.code === 409 ||
        e.body?.code === 409 ||
        msg.includes('already exists')
      ) {
        return;
      }
      throw new Error(`Failed to grant cluster view access for user ${username}: ${msg}`);
    }
  }

  /**
   * Grant the test user a custom Role with ONLY addvolume/removevolume subresource permissions
   * (subresources.kubevirt.io). This is the minimum permission required to hotplug a disk to a
   * running VM via the WebUI (CNV-83495 fix). Intentionally does NOT grant kubevirt.io:edit or
   * admin, so the SubjectAccessReview for the main VM resource fails and only the subresource
   * check passes — exercising the exact fix in DiskList.tsx.
   */
  async grantUserHotplugSubresourceAccess(namespace: string, username: string): Promise<void> {
    const roleName = 'test-user-hotplug-subresource';
    const bindingName = 'test-user-hotplug-subresource';
    try {
      const role: k8s.V1Role = {
        apiVersion: 'rbac.authorization.k8s.io/v1',
        kind: 'Role',
        metadata: { name: roleName, namespace },
        rules: [
          {
            apiGroups: ['subresources.kubevirt.io'],
            resources: ['virtualmachines/addvolume', 'virtualmachines/removevolume'],
            verbs: ['update'],
          },
        ],
      };
      await this.ctx.rbacApi.createNamespacedRole({ namespace, body: role });
    } catch (error: unknown) {
      const e = asK8sClientError(error);
      const msg = getErrorMessage(error);
      if (e.statusCode !== 409 && e.body?.code !== 409 && !msg.includes('409')) {
        throw new Error(
          `Failed to create hotplug subresource Role in namespace ${namespace}: ${msg}`,
        );
      }
    }
    try {
      const roleBinding: k8s.V1RoleBinding = {
        apiVersion: 'rbac.authorization.k8s.io/v1',
        kind: 'RoleBinding',
        metadata: { name: bindingName, namespace },
        roleRef: {
          apiGroup: 'rbac.authorization.k8s.io',
          kind: 'Role',
          name: roleName,
        },
        subjects: [{ apiGroup: 'rbac.authorization.k8s.io', kind: 'User', name: username }],
      };
      await this.ctx.rbacApi.createNamespacedRoleBinding({ namespace, body: roleBinding });
    } catch (error: unknown) {
      const e = asK8sClientError(error);
      const msg = getErrorMessage(error);
      if (e.statusCode !== 409 && e.body?.code !== 409 && !msg.includes('409')) {
        throw new Error(
          `Failed to create hotplug subresource RoleBinding in namespace ${namespace}: ${msg}`,
        );
      }
    }
  }

  async grantUserKubevirtAccessToNamespace(namespace: string, username: string): Promise<void> {
    if (this.isSystemNamespaceExcludedForTestUser(namespace)) {
      return;
    }
    const bindingName = 'test-user-kubevirt-edit';
    const clusterRoleName = 'kubevirt.io:edit';
    try {
      const roleBinding: k8s.V1RoleBinding = {
        apiVersion: 'rbac.authorization.k8s.io/v1',
        kind: 'RoleBinding',
        metadata: {
          name: bindingName,
          namespace,
        },
        roleRef: {
          apiGroup: 'rbac.authorization.k8s.io',
          kind: 'ClusterRole',
          name: clusterRoleName,
        },
        subjects: [
          {
            apiGroup: 'rbac.authorization.k8s.io',
            kind: 'User',
            name: username,
          },
        ],
      };
      await this.ctx.rbacApi.createNamespacedRoleBinding({ namespace, body: roleBinding });
    } catch (error: unknown) {
      const e = asK8sClientError(error);
      const msg = getErrorMessage(error);
      if (
        e.statusCode === 409 ||
        e.code === 409 ||
        e.body?.code === 409 ||
        msg.includes('already exists')
      ) {
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
          const newSubject = {
            apiGroup: 'rbac.authorization.k8s.io' as const,
            kind: 'User' as const,
            name: username,
          };
          // The k8s client library defaults to application/json-patch+json — use JSON Patch ops.
          await this.ctx.rbacApi.patchNamespacedRoleBinding({
            name: bindingName,
            namespace,
            body: [{ op: 'replace', path: '/subjects', value: [...subjects, newSubject] }],
          });
        } catch (patchError: unknown) {
          throw new Error(
            `Failed to add user ${username} to KubeVirt RoleBinding in namespace ${namespace}: ${getErrorMessage(
              patchError,
            )}`,
          );
        }
      } else {
        // 404 on the namespace itself — it may not be ready yet; re-raise with context
        if (
          e.statusCode === 404 ||
          e.code === 404 ||
          e.body?.code === 404 ||
          msg.includes('404') ||
          msg.includes('not found')
        ) {
          throw new Error(
            `Failed to grant user ${username} KubeVirt access in namespace ${namespace}: namespace not found (404). ` +
              `Ensure the namespace exists and is Active before granting RBAC.`,
          );
        }
        throw new Error(
          `Failed to grant user ${username} KubeVirt access in namespace ${namespace}: ${msg}. ` +
            `Ensure ClusterRole ${clusterRoleName} exists (KubeVirt operator install).`,
        );
      }
    }
  }

  async grantUserTemplateListAccess(namespace: string, username: string): Promise<void> {
    if (this.isSystemNamespaceExcludedForTestUser(namespace)) {
      return;
    }
    const roleName = 'test-user-template-reader';
    const bindingName = 'test-user-template-reader';
    try {
      const role: k8s.V1Role = {
        apiVersion: 'rbac.authorization.k8s.io/v1',
        kind: 'Role',
        metadata: { name: roleName, namespace },
        rules: [
          {
            apiGroups: ['template.openshift.io'],
            resources: ['templates'],
            verbs: ['get', 'list'],
          },
        ],
      };
      await this.ctx.rbacApi.createNamespacedRole({ namespace, body: role });
    } catch (error: unknown) {
      const e = asK8sClientError(error);
      const msg = getErrorMessage(error);
      if (e.statusCode !== 409 && e.body?.code !== 409 && !msg.includes('409')) {
        throw new Error(`Failed to create Role ${roleName} in namespace ${namespace}: ${msg}`);
      }
    }
    try {
      const roleBinding: k8s.V1RoleBinding = {
        apiVersion: 'rbac.authorization.k8s.io/v1',
        kind: 'RoleBinding',
        metadata: { name: bindingName, namespace },
        roleRef: {
          apiGroup: 'rbac.authorization.k8s.io',
          kind: 'Role',
          name: roleName,
        },
        subjects: [{ apiGroup: 'rbac.authorization.k8s.io', kind: 'User', name: username }],
      };
      await this.ctx.rbacApi.createNamespacedRoleBinding({ namespace, body: roleBinding });
    } catch (error: unknown) {
      const e = asK8sClientError(error);
      const msg = getErrorMessage(error);
      if (e.statusCode !== 409 && e.body?.code !== 409 && !msg.includes('409')) {
        throw new Error(
          `Failed to create RoleBinding ${bindingName} in namespace ${namespace}: ${msg}`,
        );
      }
    }
  }

  async grantUserViewAccessToNamespace(namespace: string, username: string): Promise<void> {
    const bindingName = 'test-user-view';
    try {
      const roleBinding: k8s.V1RoleBinding = {
        apiVersion: 'rbac.authorization.k8s.io/v1',
        kind: 'RoleBinding',
        metadata: { name: bindingName, namespace },
        roleRef: {
          apiGroup: 'rbac.authorization.k8s.io',
          kind: 'ClusterRole',
          name: 'view',
        },
        subjects: [{ apiGroup: 'rbac.authorization.k8s.io', kind: 'User', name: username }],
      };
      await this.ctx.rbacApi.createNamespacedRoleBinding({ namespace, body: roleBinding });
    } catch (error: unknown) {
      const e = asK8sClientError(error);
      const msg = getErrorMessage(error);
      if (
        e.statusCode === 409 ||
        e.code === 409 ||
        e.body?.code === 409 ||
        msg.includes('already exists')
      ) {
        return;
      }
      throw new Error(
        `Failed to grant user ${username} view access in namespace ${namespace}: ${msg}`,
      );
    }
  }

  async migrationPolicyExists(policyName: string): Promise<boolean> {
    try {
      await this.ctx.getClusterCustomResource(
        'migrations.kubevirt.io',
        'v1alpha1',
        'migrationpolicies',
        policyName,
      );
      return true;
    } catch (error: unknown) {
      const msg = getErrorMessage(error);
      if (msg.includes('404') || msg.includes('not found')) {
        return false;
      }
      throw error;
    }
  }

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

  async verifyMigrationPolicyCreated(
    policyName: string,
    timeoutMs = 30000,
  ): Promise<{
    error?: string;
    exists: boolean;
    policy?: KubernetesResource;
  }> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
      try {
        const policy = await this.ctx.getClusterCustomResource(
          'migrations.kubevirt.io',
          'v1alpha1',
          'migrationpolicies',
          policyName,
        );

        return {
          exists: true,
          policy,
        };
      } catch (error: unknown) {
        const msg = getErrorMessage(error);
        if (msg.includes('404') || msg.includes('not found')) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          continue;
        }
        return {
          error: msg,
          exists: false,
        };
      }
    }

    return {
      error: `Timeout after ${timeoutMs}ms waiting for MigrationPolicy ${policyName} to be created`,
      exists: false,
    };
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
}
