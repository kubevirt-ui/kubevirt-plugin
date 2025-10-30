import {
  ClusterRoleBindingModel,
  RoleBindingModel,
  RoleModel,
  ServiceAccountModel,
} from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiRbacV1ClusterRoleBinding } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { k8sCreate, k8sDelete, k8sGet, k8sPatch } from '@openshift-console/dynamic-plugin-sdk';

import {
  SELF_VALIDATION_CLUSTER_ROLE_BINDING,
  SELF_VALIDATION_ROLE,
  SELF_VALIDATION_SA,
} from './constants';

const serviceAccountResource = (namespace: string) => ({
  metadata: { name: SELF_VALIDATION_SA, namespace },
});

const selfValidationRole = (namespace: string) => ({
  apiVersion: 'rbac.authorization.k8s.io/v1',
  kind: 'Role',
  metadata: { name: SELF_VALIDATION_ROLE, namespace },
  rules: [
    { apiGroups: [''], resources: ['configmaps'], verbs: ['get', 'update', 'patch'] },
    { apiGroups: [''], resources: ['pods'], verbs: ['get', 'list'] },
    { apiGroups: [''], resources: ['persistentvolumeclaims'], verbs: ['get', 'list'] },
    { apiGroups: ['batch'], resources: ['jobs'], verbs: ['get', 'list'] },
  ],
});

const selfValidationRoleBinding = (namespace: string) => ({
  apiVersion: 'rbac.authorization.k8s.io/v1',
  kind: 'RoleBinding',
  metadata: { name: SELF_VALIDATION_ROLE, namespace },
  roleRef: { apiGroup: 'rbac.authorization.k8s.io', kind: 'Role', name: SELF_VALIDATION_ROLE },
  subjects: [{ kind: 'ServiceAccount', name: SELF_VALIDATION_SA, namespace }],
});

const selfValidationClusterRoleBinding = (namespace: string): IoK8sApiRbacV1ClusterRoleBinding => ({
  apiVersion: 'rbac.authorization.k8s.io/v1',
  kind: 'ClusterRoleBinding',
  metadata: { name: SELF_VALIDATION_CLUSTER_ROLE_BINDING },
  roleRef: { apiGroup: 'rbac.authorization.k8s.io', kind: 'ClusterRole', name: 'cluster-admin' },
  subjects: [{ kind: 'ServiceAccount', name: SELF_VALIDATION_SA, namespace }],
});

export const installPermissions = async (namespace: string) => {
  // Create ServiceAccount if it doesn't exist
  try {
    await k8sGet({
      model: ServiceAccountModel,
      name: SELF_VALIDATION_SA,
      ns: namespace,
    });
  } catch {
    // ServiceAccount doesn't exist, create it
    await k8sCreate({
      data: serviceAccountResource(namespace),
      model: ServiceAccountModel,
    });
  }

  // Create Role if it doesn't exist
  try {
    await k8sGet({
      model: RoleModel,
      name: SELF_VALIDATION_ROLE,
      ns: namespace,
    });
  } catch {
    // Role doesn't exist, create it
    await k8sCreate({
      data: selfValidationRole(namespace),
      model: RoleModel,
    });
  }

  // Create RoleBinding if it doesn't exist
  try {
    await k8sGet({
      model: RoleBindingModel,
      name: SELF_VALIDATION_ROLE,
      ns: namespace,
    });
  } catch {
    // RoleBinding doesn't exist, create it
    await k8sCreate({
      data: selfValidationRoleBinding(namespace),
      model: RoleBindingModel,
    });
  }

  // Create or update ClusterRoleBinding
  try {
    const existingClusterRoleBinding = await k8sGet({
      model: ClusterRoleBindingModel,
      name: SELF_VALIDATION_CLUSTER_ROLE_BINDING,
    });

    // Check if the ServiceAccount for this namespace is already in the subjects
    const crb = existingClusterRoleBinding as IoK8sApiRbacV1ClusterRoleBinding;
    const hasSubjectForNamespace = crb.subjects?.some(
      (subject) =>
        subject?.kind === 'ServiceAccount' &&
        subject?.name === SELF_VALIDATION_SA &&
        subject?.namespace === namespace,
    );

    if (!hasSubjectForNamespace) {
      // Add the ServiceAccount for this namespace to the subjects
      const updatedSubjects = [
        ...(crb.subjects || []),
        { kind: 'ServiceAccount', name: SELF_VALIDATION_SA, namespace },
      ];

      await k8sPatch({
        data: [{ op: 'replace', path: '/subjects', value: updatedSubjects }],
        model: ClusterRoleBindingModel,
        resource: existingClusterRoleBinding,
      });
    }
  } catch {
    // ClusterRoleBinding doesn't exist, create it
    await k8sCreate({
      data: selfValidationClusterRoleBinding(namespace),
      model: ClusterRoleBindingModel,
    });
  }
};

export const uninstallPermissions = async (namespace: string) => {
  try {
    const existingClusterRoleBinding = await k8sGet({
      model: ClusterRoleBindingModel,
      name: SELF_VALIDATION_CLUSTER_ROLE_BINDING,
    });

    // Remove the ServiceAccount for this namespace from the subjects
    const crb = existingClusterRoleBinding as IoK8sApiRbacV1ClusterRoleBinding;
    const updatedSubjects = (crb.subjects || []).filter(
      (subject) =>
        !(
          subject?.kind === 'ServiceAccount' &&
          subject?.name === SELF_VALIDATION_SA &&
          subject?.namespace === namespace
        ),
    );

    if (updatedSubjects.length === 0) {
      // If no subjects left, delete the entire ClusterRoleBinding
      await k8sDelete({
        model: ClusterRoleBindingModel,
        resource: { metadata: { name: SELF_VALIDATION_CLUSTER_ROLE_BINDING } },
      });
    } else {
      // Update the ClusterRoleBinding with the remaining subjects
      await k8sPatch({
        data: [{ op: 'replace', path: '/subjects', value: updatedSubjects }],
        model: ClusterRoleBindingModel,
        resource: existingClusterRoleBinding,
      });
    }
  } catch {
    // Ignore if not found
  }

  try {
    await k8sDelete({
      model: RoleBindingModel,
      resource: { metadata: { name: SELF_VALIDATION_ROLE, namespace } },
    });
  } catch {
    // Ignore if not found
  }

  try {
    await k8sDelete({
      model: RoleModel,
      resource: { metadata: { name: SELF_VALIDATION_ROLE, namespace } },
    });
  } catch {
    // Ignore if not found
  }

  try {
    await k8sDelete({
      model: ServiceAccountModel,
      resource: { metadata: { name: SELF_VALIDATION_SA, namespace } },
    });
  } catch {
    // Ignore if not found
  }
};
