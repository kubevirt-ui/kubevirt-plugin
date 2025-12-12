import { TFunction } from 'react-i18next';

import {
  ClusterRoleBindingModel,
  ClusterRoleModel,
  RoleBindingModel,
  RoleModel,
  ServiceAccountModel,
} from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiRbacV1ClusterRoleBinding } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import {
  kubevirtK8sCreate,
  kubevirtK8sDelete,
  kubevirtK8sGet,
  kubevirtK8sPatch,
} from '@multicluster/k8sRequests';
import { checkAccess, K8sModel, K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

import {
  SELF_VALIDATION_CLUSTER_ROLE_BINDING,
  SELF_VALIDATION_ROLE,
  SELF_VALIDATION_SA,
} from './constants';

const getPermissionDeniedMessage = (t: TFunction): string =>
  t('The self validation checkup requires cluster-admin access.');

const getFailedToModifyMessage = (t: TFunction, resourceKind: string): string =>
  t('Failed to modify {{resourceKind}}', { resourceKind });

export type PermissionOperationResult = {
  error: null | string;
  success: boolean;
};

/**
 * Extracts HTTP status code from k8s SDK error
 * Checks multiple possible error properties as the SDK may structure errors differently
 * @param error - The error object from k8s SDK
 * @returns The HTTP status code or undefined if not found
 */
const getErrorStatusCode = (error: any): number | undefined => {
  // Check error.response.status (standard HTTP error structure)
  if (error?.response?.status) {
    return error.response.status;
  }
  // Check error.code (some SDK versions use this)
  if (typeof error?.code === 'number') {
    return error.code;
  }
  // Check error.json.code (some SDK versions nest the code)
  if (typeof error?.json?.code === 'number') {
    return error.json.code;
  }
  return undefined;
};

/**
 * Checks if an error represents a specific HTTP status code
 * @param error - The error object from k8s SDK
 * @param statusCode - The HTTP status code to check for
 * @returns True if the error matches the status code
 */
const isErrorStatusCode = (error: any, statusCode: number): boolean => {
  return getErrorStatusCode(error) === statusCode;
};

/**
 * Handles errors during resource deletion, ignoring 404 (not found) errors
 * Returns an error result if the error is not a 404, otherwise returns null
 * @param error - The error object from k8s SDK
 * @param resourceKind - The kind of resource being deleted (e.g., 'ServiceAccount', 'Role')
 * @param t - Translation function
 * @returns Error result if error is not 404, null if 404 (can be ignored)
 */
const handleDeleteError = (
  error: any,
  resourceKind: string,
  t: TFunction,
): null | PermissionOperationResult => {
  // If not found (404), that's okay - continue with cleanup
  if (!isErrorStatusCode(error, 404)) {
    const errorMessage = getFailedToModifyMessage(t, resourceKind);
    kubevirtConsole.error(`Failed to remove ${resourceKind}:`, error);
    return { error: errorMessage, success: false };
  }
  return null;
};

/**
 * Gets a resource if it exists, or creates it if it doesn't (404 error)
 * This is a common pattern for idempotent resource creation
 * @param getOptions - Options for k8sGet
 * @param createOptions - Options for k8sCreate
 * @param resourceKind - The kind of resource (e.g., 'ServiceAccount', 'Role')
 * @param t - Translation function
 * @returns Error message if creation fails, null if successful
 */
const getOrCreateResource = async (
  getOptions: { model: K8sModel; name: string; ns?: string },
  createOptions: { cluster: string; data: K8sResourceCommon; model: K8sModel },
  resourceKind: string,
  t: TFunction,
): Promise<null | string> => {
  try {
    await kubevirtK8sGet(getOptions);
    // Resource exists, no need to create
    return null;
  } catch (error) {
    // Only create if resource doesn't exist (404)
    if (isErrorStatusCode(error, 404)) {
      try {
        await kubevirtK8sCreate(createOptions);
        return null;
      } catch (createError) {
        const errorMessage = getFailedToModifyMessage(t, resourceKind);
        kubevirtConsole.error(`Failed to create ${resourceKind}:`, createError);
        return errorMessage;
      }
    }
    // Re-throw non-404 errors (permission errors, etc.)
    const errorMessage = getFailedToModifyMessage(t, resourceKind);
    kubevirtConsole.error(`Failed to get ${resourceKind}:`, error);
    return errorMessage;
  }
};

const serviceAccountResource = (namespace: string) => ({
  metadata: { name: SELF_VALIDATION_SA, namespace },
});

const selfValidationRole = (namespace: string) => ({
  apiVersion: 'rbac.authorization.k8s.io/v1',
  kind: RoleModel.kind,
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
  roleRef: {
    apiGroup: 'rbac.authorization.k8s.io',
    kind: RoleModel.kind,
    name: SELF_VALIDATION_ROLE,
  },
  subjects: [{ kind: ServiceAccountModel.kind, name: SELF_VALIDATION_SA, namespace }],
});

const selfValidationClusterRoleBinding = (namespace: string): IoK8sApiRbacV1ClusterRoleBinding => ({
  apiVersion: 'rbac.authorization.k8s.io/v1',
  kind: ClusterRoleBindingModel.kind,
  metadata: { name: SELF_VALIDATION_CLUSTER_ROLE_BINDING },
  roleRef: {
    apiGroup: ClusterRoleModel.apiGroup,
    kind: ClusterRoleModel.kind,
    name: 'cluster-admin',
  },
  subjects: [{ kind: ServiceAccountModel.kind, name: SELF_VALIDATION_SA, namespace }],
});

export const installPermissions = async (
  namespace: string,
  cluster: string,
  t: TFunction,
): Promise<PermissionOperationResult> => {
  // Create ServiceAccount, Role, and RoleBinding if they don't exist
  const [serviceAccountError, roleError, roleBindingError] = await Promise.all([
    getOrCreateResource(
      {
        model: ServiceAccountModel,
        name: SELF_VALIDATION_SA,
        ns: namespace,
      },
      {
        cluster,
        data: serviceAccountResource(namespace),
        model: ServiceAccountModel,
      },
      ServiceAccountModel.kind,
      t,
    ),
    getOrCreateResource(
      {
        model: RoleModel,
        name: SELF_VALIDATION_ROLE,
        ns: namespace,
      },
      {
        cluster,
        data: selfValidationRole(namespace),
        model: RoleModel,
      },
      RoleModel.kind,
      t,
    ),
    getOrCreateResource(
      {
        model: RoleBindingModel,
        name: SELF_VALIDATION_ROLE,
        ns: namespace,
      },
      {
        cluster,
        data: selfValidationRoleBinding(namespace),
        model: RoleBindingModel,
      },
      RoleBindingModel.kind,
      t,
    ),
  ]);

  // Check if any operation failed
  const error = serviceAccountError || roleError || roleBindingError;
  if (error) {
    return { error, success: false };
  }

  // Check if user has permission to create ClusterRoleBinding
  // Note: Kubernetes will enforce binding permissions when we try to bind to cluster-admin
  try {
    const accessReview = await checkAccess({
      group: 'rbac.authorization.k8s.io',
      resource: ClusterRoleBindingModel.plural,
      verb: 'create',
    });

    if (!accessReview?.status?.allowed) {
      const errorMessage = getPermissionDeniedMessage(t);
      kubevirtConsole.error('Permission check failed:', errorMessage);
      return {
        error: errorMessage,
        success: false,
      };
    }
  } catch (checkAccessError) {
    // If checkAccess itself fails, we'll still try to create and let Kubernetes enforce permissions
    // This allows the operation to proceed if checkAccess is unavailable, but Kubernetes will still enforce permissions
  }

  // Create or update ClusterRoleBinding
  try {
    const existingClusterRoleBinding = await kubevirtK8sGet({
      model: ClusterRoleBindingModel,
      name: SELF_VALIDATION_CLUSTER_ROLE_BINDING,
    });

    // Check if the ServiceAccount for this namespace is already in the subjects
    const crb = existingClusterRoleBinding as IoK8sApiRbacV1ClusterRoleBinding;
    const hasSubjectForNamespace = crb.subjects?.some(
      (subject) =>
        subject?.kind === ServiceAccountModel.kind &&
        subject?.name === SELF_VALIDATION_SA &&
        subject?.namespace === namespace,
    );

    if (!hasSubjectForNamespace) {
      // Add the ServiceAccount for this namespace to the subjects
      const updatedSubjects = [
        ...(crb.subjects || []),
        { kind: ServiceAccountModel.kind, name: SELF_VALIDATION_SA, namespace },
      ];

      await kubevirtK8sPatch({
        cluster,
        data: [
          { op: 'test', path: '/subjects', value: crb.subjects || [] },
          { op: 'replace', path: '/subjects', value: updatedSubjects },
        ],
        model: ClusterRoleBindingModel,
        resource: existingClusterRoleBinding,
      });
    }
  } catch (clusterRoleBindingError) {
    // If k8sGet fails, ClusterRoleBinding doesn't exist, try to create it
    if (isErrorStatusCode(clusterRoleBindingError, 404)) {
      try {
        await kubevirtK8sCreate({
          cluster,
          data: selfValidationClusterRoleBinding(namespace),
          model: ClusterRoleBindingModel,
        });
      } catch (createError) {
        if (isErrorStatusCode(createError, 403)) {
          const errorMessage = getPermissionDeniedMessage(t);
          kubevirtConsole.error('Failed to create ClusterRoleBinding:', errorMessage);
          return {
            error: errorMessage,
            success: false,
          };
        }
        const errorMessage = getFailedToModifyMessage(t, ClusterRoleBindingModel.kind);
        kubevirtConsole.error(`Failed to create ${ClusterRoleBindingModel.kind}:`, createError);
        return { error: errorMessage, success: false };
      }
    } else {
      // Handle other errors (including permission errors from k8sPatch)
      if (isErrorStatusCode(clusterRoleBindingError, 403)) {
        const errorMessage = getPermissionDeniedMessage(t);
        kubevirtConsole.error('Failed to update ClusterRoleBinding:', errorMessage);
        return {
          error: errorMessage,
          success: false,
        };
      }
      const errorMessage = getFailedToModifyMessage(t, ClusterRoleBindingModel.kind);
      kubevirtConsole.error(
        `Failed to update ${ClusterRoleBindingModel.kind}:`,
        clusterRoleBindingError,
      );
      return { error: errorMessage, success: false };
    }
  }

  return { error: null, success: true };
};

export const uninstallPermissions = async (
  namespace: string,
  cluster: string,
  t: TFunction,
): Promise<PermissionOperationResult> => {
  try {
    const existingClusterRoleBinding = await kubevirtK8sGet({
      cluster,
      model: ClusterRoleBindingModel,
      name: SELF_VALIDATION_CLUSTER_ROLE_BINDING,
    });

    // Remove the ServiceAccount for this namespace from the subjects
    const crb = existingClusterRoleBinding as IoK8sApiRbacV1ClusterRoleBinding;
    const updatedSubjects = (crb.subjects || []).filter(
      (subject) =>
        !(
          subject?.kind === ServiceAccountModel.kind &&
          subject?.name === SELF_VALIDATION_SA &&
          subject?.namespace === namespace
        ),
    );

    if (updatedSubjects.length === 0) {
      // If no subjects left, delete the entire ClusterRoleBinding
      await kubevirtK8sDelete({
        cluster,
        model: ClusterRoleBindingModel,
        resource: { metadata: { name: SELF_VALIDATION_CLUSTER_ROLE_BINDING } },
      });
    } else {
      // Update the ClusterRoleBinding with the remaining subjects
      await kubevirtK8sPatch({
        cluster,
        data: [
          { op: 'test', path: '/subjects', value: crb.subjects || [] },
          { op: 'replace', path: '/subjects', value: updatedSubjects },
        ],
        model: ClusterRoleBindingModel,
        resource: existingClusterRoleBinding,
      });
    }
  } catch (error) {
    const deleteError = handleDeleteError(error, ClusterRoleBindingModel.kind, t);
    if (deleteError) return deleteError;
  }

  try {
    await kubevirtK8sDelete({
      cluster,
      model: RoleBindingModel,
      resource: { metadata: { name: SELF_VALIDATION_ROLE, namespace } },
    });
  } catch (error) {
    const deleteError = handleDeleteError(error, RoleBindingModel.kind, t);
    if (deleteError) return deleteError;
  }

  try {
    await kubevirtK8sDelete({
      cluster,
      model: RoleModel,
      resource: { metadata: { name: SELF_VALIDATION_ROLE, namespace } },
    });
  } catch (error) {
    const deleteError = handleDeleteError(error, RoleModel.kind, t);
    if (deleteError) return deleteError;
  }

  try {
    await kubevirtK8sDelete({
      cluster,
      model: ServiceAccountModel,
      resource: { metadata: { name: SELF_VALIDATION_SA, namespace } },
    });
  } catch (error) {
    const deleteError = handleDeleteError(error, ServiceAccountModel.kind, t);
    if (deleteError) return deleteError;
  }

  return { error: null, success: true };
};
