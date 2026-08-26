import { type TFunction } from 'i18next';

import {
  ClusterRoleBindingModel,
  RoleBindingModel,
  RoleModel,
  ServiceAccountModel,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import { type IoK8sApiRbacV1ClusterRoleBinding } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { kubevirtK8sDelete, kubevirtK8sGet, kubevirtK8sPatch } from '@multicluster/k8sRequests';
import { checkAccess } from '@stolostron/multicluster-sdk/lib/internal/checkAccess';

import {
  SELF_VALIDATION_CLUSTER_ROLE_BINDING,
  SELF_VALIDATION_ROLE,
  SELF_VALIDATION_SA,
} from './constants';
import { handleClusterRoleBinding } from './selfValidationCRB';
import {
  getOrCreateResource,
  getPermissionDeniedMessage,
  handleDeleteError,
  type PermissionOperationResult,
  selfValidationRole,
  selfValidationRoleBinding,
  serviceAccountResource,
} from './selfValidationResources';

export type { PermissionOperationResult } from './selfValidationResources';

type AccessReview = { status?: { allowed?: boolean } };

export const installPermissions = async (
  namespace: string,
  cluster: string,
  t: TFunction,
): Promise<PermissionOperationResult> => {
  // Check cluster-admin permission first to avoid creating partial namespaced RBAC state
  // when the user lacks permission to bind to cluster-admin.
  try {
    const accessReview = (await checkAccess(
      ClusterRoleBindingModel.apiGroup,
      ClusterRoleBindingModel.plural,
      null,
      'create',
      null,
      null,
      cluster,
    )) as AccessReview;

    if (!accessReview?.status?.allowed) {
      const errorMessage = getPermissionDeniedMessage(t);
      kubevirtConsole.error('Permission check failed:', errorMessage);
      return { error: errorMessage, success: false };
    }
  } catch (checkAccessError) {
    // If checkAccess itself fails, proceed and let Kubernetes enforce permissions on the target cluster
    kubevirtConsole.warn('checkAccess for ClusterRoleBinding failed:', checkAccessError);
  }

  // Create ServiceAccount, Role, and RoleBinding if they don't exist
  const [saError, roleError, rbError] = await Promise.all([
    getOrCreateResource(
      { cluster, model: ServiceAccountModel, name: SELF_VALIDATION_SA, ns: namespace },
      { cluster, data: serviceAccountResource(namespace), model: ServiceAccountModel },
      ServiceAccountModel.kind,
      t,
    ),
    getOrCreateResource(
      { cluster, model: RoleModel, name: SELF_VALIDATION_ROLE, ns: namespace },
      { cluster, data: selfValidationRole(namespace), model: RoleModel },
      RoleModel.kind,
      t,
    ),
    getOrCreateResource(
      { cluster, model: RoleBindingModel, name: SELF_VALIDATION_ROLE, ns: namespace },
      { cluster, data: selfValidationRoleBinding(namespace), model: RoleBindingModel },
      RoleBindingModel.kind,
      t,
    ),
  ]);

  const error = saError ?? roleError ?? rbError;
  if (error) {
    return { error, success: false };
  }

  const crbResult = await handleClusterRoleBinding(namespace, cluster, t);
  return crbResult ?? { error: null, success: true };
};

export const uninstallPermissions = async (
  namespace: string,
  cluster: string,
  t: TFunction,
): Promise<PermissionOperationResult> => {
  try {
    const existing = await kubevirtK8sGet({
      cluster,
      model: ClusterRoleBindingModel,
      name: SELF_VALIDATION_CLUSTER_ROLE_BINDING,
    });
    // Remove the ServiceAccount for this namespace from the subjects
    const crb = existing as IoK8sApiRbacV1ClusterRoleBinding;
    const updatedSubjects = (crb.subjects ?? []).filter(
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
          { op: 'test', path: '/subjects', value: crb.subjects ?? [] },
          { op: 'replace', path: '/subjects', value: updatedSubjects },
        ],
        model: ClusterRoleBindingModel,
        resource: existing,
      });
    }
  } catch (error) {
    const deleteError = handleDeleteError(error, ClusterRoleBindingModel.kind, t);
    if (deleteError) {
      return deleteError;
    }
  }

  const deleteResources = [
    { model: RoleBindingModel, name: SELF_VALIDATION_ROLE },
    { model: RoleModel, name: SELF_VALIDATION_ROLE },
    { model: ServiceAccountModel, name: SELF_VALIDATION_SA },
  ];

  for (const { model, name } of deleteResources) {
    try {
      await kubevirtK8sDelete({ cluster, model, resource: { metadata: { name, namespace } } });
    } catch (error) {
      const deleteError = handleDeleteError(error, model.kind, t);
      if (deleteError) {
        return deleteError;
      }
    }
  }

  return { error: null, success: true };
};
