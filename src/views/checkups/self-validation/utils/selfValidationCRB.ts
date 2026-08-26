import { type TFunction } from 'i18next';

import {
  ClusterRoleBindingModel,
  ServiceAccountModel,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import { type IoK8sApiRbacV1ClusterRoleBinding } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { kubevirtK8sCreate, kubevirtK8sGet, kubevirtK8sPatch } from '@multicluster/k8sRequests';

import { SELF_VALIDATION_CLUSTER_ROLE_BINDING, SELF_VALIDATION_SA } from './constants';
import {
  getFailedToModifyMessage,
  getPermissionDeniedMessage,
  isErrorStatusCode,
  type PermissionOperationResult,
  selfValidationClusterRoleBinding,
} from './selfValidationResources';

const createClusterRoleBinding = async (
  namespace: string,
  cluster: string,
  t: TFunction,
): Promise<null | PermissionOperationResult> => {
  try {
    await kubevirtK8sCreate({
      cluster,
      data: selfValidationClusterRoleBinding(namespace),
      model: ClusterRoleBindingModel,
    });
    return null;
  } catch (createError) {
    const errorMessage = isErrorStatusCode(createError, 403)
      ? getPermissionDeniedMessage(t)
      : getFailedToModifyMessage(t, ClusterRoleBindingModel.kind);
    kubevirtConsole.error(`Failed to create ${ClusterRoleBindingModel.kind}:`, createError);
    return { error: errorMessage, success: false };
  }
};

export const handleClusterRoleBinding = async (
  namespace: string,
  cluster: string,
  t: TFunction,
): Promise<null | PermissionOperationResult> => {
  try {
    const existing = await kubevirtK8sGet({
      cluster,
      model: ClusterRoleBindingModel,
      name: SELF_VALIDATION_CLUSTER_ROLE_BINDING,
    });
    // Check if the ServiceAccount for this namespace is already in the subjects
    const crb = existing as IoK8sApiRbacV1ClusterRoleBinding;
    const hasSubject = crb.subjects?.some(
      (subject) =>
        subject?.kind === ServiceAccountModel.kind &&
        subject?.name === SELF_VALIDATION_SA &&
        subject?.namespace === namespace,
    );

    if (!hasSubject) {
      // Add the ServiceAccount for this namespace to the subjects
      const updatedSubjects = [
        ...(crb.subjects ?? []),
        { kind: ServiceAccountModel.kind, name: SELF_VALIDATION_SA, namespace },
      ];
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
    return null;
  } catch (crbError) {
    // If k8sGet fails with 404, ClusterRoleBinding doesn't exist — try to create it
    if (isErrorStatusCode(crbError, 404)) {
      return createClusterRoleBinding(namespace, cluster, t);
    }
    const errorMessage = isErrorStatusCode(crbError, 403)
      ? getPermissionDeniedMessage(t)
      : getFailedToModifyMessage(t, ClusterRoleBindingModel.kind);
    kubevirtConsole.error(`Failed to update ${ClusterRoleBindingModel.kind}:`, crbError);
    return { error: errorMessage, success: false };
  }
};
