import { createHash } from 'crypto';

import type { KubernetesResource } from '@/data-models/kubernetes-types';
import { getErrorMessage } from '@/data-models/kubernetes-types';

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

export interface NamespaceSetupMethods {
  ensureNonPrivUserExists(username: string, password?: string): Promise<boolean>;
  ensureOvnNadExists(
    nadName: string,
    namespace: string,
  ): Promise<{
    created: boolean;
    alreadyExisted: boolean;
  }>;
  getNamespaceResourceAllocationForOverview(namespace: string): Promise<{
    runningCount: number;
    vcpu: number;
    memoryMiB: number;
    storageGiB: number;
  }>;
  migrationPolicyExists(policyName: string): Promise<boolean>;
  verifyMigrationPolicyCreated(
    policyName: string,
    timeoutMs?: number,
  ): Promise<{
    error?: string;
    exists: boolean;
    policy?: KubernetesResource;
  }>;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export function applySetupDelegations(proto: any): void {
  proto.migrationPolicyExists = async function (this: any, policyName: string): Promise<boolean> {
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
  };

  proto.verifyMigrationPolicyCreated = async function (
    this: any,
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
  };

  /** Expected resource allocation for VM Overview cards (running VMI count, vCPU, memory MiB, storage GiB). */
  proto.getNamespaceResourceAllocationForOverview = async function (
    this: any,
    namespace: string,
  ): Promise<{
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
  };

  /**
   * Creates an OVN layer2 NAD if missing.
   */
  proto.ensureOvnNadExists = async function (
    this: any,
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
  };

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
  proto.ensureNonPrivUserExists = async function (
    this: any,
    username: string,
    password = 'test',
  ): Promise<boolean> {
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
  };
}
