export interface NamespaceCheckupMethods {
  ensureStorageCheckupPermissions(namespace: string): Promise<{
    results: Record<string, { created: boolean; alreadyExisted: boolean }>;
    anyCreated: boolean;
  }>;
  ensureNetworkCheckupPermissions(namespace: string): Promise<{
    results: Record<string, { created: boolean; alreadyExisted: boolean }>;
    anyCreated: boolean;
  }>;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export function applyCheckupDelegations(proto: any): void {
  /**
   * Ensures ServiceAccount, Role, RoleBinding, and ClusterRoleBinding required for storage checkup tests.
   *
   */
  proto.ensureStorageCheckupPermissions = async function (
    this: any,
    namespace: string,
  ): Promise<{
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
  };

  /**
   * Ensures RBAC for network latency checkup tests.
   *
   */
  proto.ensureNetworkCheckupPermissions = async function (
    this: any,
    namespace: string,
  ): Promise<{
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
  };
}
