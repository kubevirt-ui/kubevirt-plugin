import { type TFunction } from 'i18next';

import {
  ClusterRoleBindingModel,
  ClusterRoleModel,
  RoleModel,
  ServiceAccountModel,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import { type IoK8sApiRbacV1ClusterRoleBinding } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { kubevirtK8sCreate, kubevirtK8sGet } from '@multicluster/k8sRequests';
import { type K8sModel, type K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

import {
  SELF_VALIDATION_CLUSTER_ROLE_BINDING,
  SELF_VALIDATION_ROLE,
  SELF_VALIDATION_SA,
} from './constants';

export type PermissionOperationResult = {
  error: null | string;
  success: boolean;
};

type K8sError = {
  code?: number;
  json?: { code?: number };
  response?: { status?: number };
};

export const getPermissionDeniedMessage = (t: TFunction): string =>
  t('The self validation checkup requires cluster-admin access.');

export const getFailedToModifyMessage = (t: TFunction, resourceKind: string): string =>
  t('Failed to modify {{resourceKind}}', { resourceKind });

/**
 * Extracts HTTP status code from k8s SDK error
 * Checks multiple possible error properties as the SDK may structure errors differently
 */
export const getErrorStatusCode = (error: unknown): number | undefined => {
  const err = error as K8sError | null | undefined;
  if (err?.response?.status) {
    return err.response.status;
  }
  if (typeof err?.code === 'number') {
    return err.code;
  }
  if (typeof err?.json?.code === 'number') {
    return err.json.code;
  }
  return undefined;
};

/**
 * Checks if an error represents a specific HTTP status code
 */
export const isErrorStatusCode = (error: unknown, statusCode: number): boolean =>
  getErrorStatusCode(error) === statusCode;

/**
 * Handles errors during resource deletion, ignoring 404 (not found) errors
 * Returns an error result if the error is not a 404, otherwise returns null
 */
export const handleDeleteError = (
  error: unknown,
  resourceKind: string,
  t: TFunction,
): null | PermissionOperationResult => {
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
 */
export const getOrCreateResource = async (
  getOptions: { cluster?: string; model: K8sModel; name: string; ns?: string },
  createOptions: { cluster: string; data: K8sResourceCommon; model: K8sModel },
  resourceKind: string,
  t: TFunction,
): Promise<null | string> => {
  try {
    await kubevirtK8sGet(getOptions);
    return null;
  } catch (error) {
    if (isErrorStatusCode(error, 404)) {
      try {
        await kubevirtK8sCreate(createOptions);
        return null;
      } catch (createError) {
        if (isErrorStatusCode(createError, 409)) {
          return null;
        }
        const errorMessage = getFailedToModifyMessage(t, resourceKind);
        kubevirtConsole.error(`Failed to create ${resourceKind}:`, createError);
        return errorMessage;
      }
    }
    const errorMessage = getFailedToModifyMessage(t, resourceKind);
    kubevirtConsole.error(`Failed to get ${resourceKind}:`, error);
    return errorMessage;
  }
};

export const serviceAccountResource = (namespace: string): K8sResourceCommon => ({
  metadata: { name: SELF_VALIDATION_SA, namespace },
});

export const selfValidationRole = (
  namespace: string,
): K8sResourceCommon & { rules: unknown[] } => ({
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

export const selfValidationRoleBinding = (
  namespace: string,
): K8sResourceCommon & { roleRef: unknown; subjects: unknown[] } => ({
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

export const selfValidationClusterRoleBinding = (
  namespace: string,
): IoK8sApiRbacV1ClusterRoleBinding => ({
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
