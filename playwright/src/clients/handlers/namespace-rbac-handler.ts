import type { KubernetesResource } from '@/data-models/kubernetes-types';
import { getErrorMessage } from '@/data-models/kubernetes-types';
import type * as k8s from '@kubernetes/client-node';

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

export interface NamespaceRbacMethods {
  grantUserAccessToNamespace(namespace: string, username: string): Promise<void>;
  grantUserViewAccessToNamespace(namespace: string, username: string): Promise<void>;
  grantUserKubevirtAccessToNamespace(namespace: string, username: string): Promise<void>;
  grantUserHotplugSubresourceAccess(namespace: string, username: string): Promise<void>;
  grantUserTemplateListAccess(namespace: string, username: string): Promise<void>;
  deleteClusterRoleBinding(name: string): Promise<void>;
  grantUserClusterViewAccess(username: string): Promise<void>;
  grantUserCdiClusterReadAccess(username: string): Promise<void>;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export function applyRbacDelegations(proto: any): void {
  proto.grantUserAccessToNamespace = async function (
    this: any,
    namespace: string,
    username: string,
  ): Promise<void> {
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
  };

  proto.grantUserViewAccessToNamespace = async function (
    this: any,
    namespace: string,
    username: string,
  ): Promise<void> {
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
  };

  proto.grantUserKubevirtAccessToNamespace = async function (
    this: any,
    namespace: string,
    username: string,
  ): Promise<void> {
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
  };

  /**
   * Grant the test user a custom Role with ONLY addvolume/removevolume subresource permissions
   * (subresources.kubevirt.io). This is the minimum permission required to hotplug a disk to a
   * running VM via the WebUI (CNV-83495 fix). Intentionally does NOT grant kubevirt.io:edit or
   * admin, so the SubjectAccessReview for the main VM resource fails and only the subresource
   * check passes — exercising the exact fix in DiskList.tsx.
   */
  proto.grantUserHotplugSubresourceAccess = async function (
    this: any,
    namespace: string,
    username: string,
  ): Promise<void> {
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
  };

  proto.grantUserTemplateListAccess = async function (
    this: any,
    namespace: string,
    username: string,
  ): Promise<void> {
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
  };

  /**
   * Deletes a ClusterRoleBinding by name. 404 is silently ignored so teardown
   * is safe to call even if the binding was never created.
   */
  proto.deleteClusterRoleBinding = async function (this: any, name: string): Promise<void> {
    try {
      await this.ctx.rbacApi.deleteClusterRoleBinding({ name });
    } catch (error: unknown) {
      const msg = getErrorMessage(error);
      if (msg.includes('404') || msg.includes('not found')) {
        return;
      }
      throw new Error(`Failed to delete ClusterRoleBinding "${name}": ${msg}`);
    }
  };

  /**
   * Grants the test user a cluster-level ClusterRoleBinding for the `view` ClusterRole.
   * This gives the non-priv user read access to resources across all namespaces,
   * enabling access to the VM creation wizard catalog, templates, bootable volumes, and
   * overview widgets that query cluster-wide resources.
   *
   * The binding name is deterministic so repeated calls are idempotent (409 → skip).
   */
  proto.grantUserClusterViewAccess = async function (this: any, username: string): Promise<void> {
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
  };

  /**
   * Grants the non-priv test user cluster-wide read access to CDI resources
   * (datasources, datavolumes, dataimportcrons, datavolumes/source).
   *
   * The built-in `view` ClusterRole does not cover CDI custom resources, so the
   * Bootable Volumes page returns 403 for non-priv users without this grant.
   * A dedicated ClusterRole + ClusterRoleBinding is created idempotently.
   */
  proto.grantUserCdiClusterReadAccess = async function (
    this: any,
    username: string,
  ): Promise<void> {
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
  };
}
