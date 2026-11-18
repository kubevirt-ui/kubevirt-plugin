import {
  ClusterRoleBindingModel,
  RoleBindingModel,
  RoleModel,
  ServiceAccountModel,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import { type IoK8sApiRbacV1ClusterRoleBinding } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { kubevirtK8sDelete, kubevirtK8sPatch } from '@multicluster/k8sRequests';
import { checkAccess } from '@stolostron/multicluster-sdk/lib/internal/checkAccess';

import { installStorageCheckupPermissions } from './storagePermissionsInstall';
import {
  serviceAccountResource,
  storageCheckupRole,
  storageCheckupRoleBinding,
} from './storageResources';

type AccessReview = { status?: { allowed?: boolean } };

const removePermissions = async (
  namespace: string,
  cluster: string,
  clusterRoleBinding: IoK8sApiRbacV1ClusterRoleBinding,
): Promise<void> => {
  try {
    await Promise.allSettled([
      kubevirtK8sDelete({
        cluster,
        model: ServiceAccountModel,
        resource: serviceAccountResource(namespace),
      }),
      kubevirtK8sDelete({ cluster, model: RoleModel, resource: storageCheckupRole(namespace) }),
    ]);
    await kubevirtK8sDelete({
      cluster,
      model: RoleBindingModel,
      resource: storageCheckupRoleBinding(namespace),
    });

    const remainingSubjects =
      clusterRoleBinding?.subjects?.filter((subject) => subject?.namespace !== namespace) ?? [];

    const canDeleteCRB =
      remainingSubjects.length === 0 &&
      (
        (await checkAccess(
          ClusterRoleBindingModel.apiGroup,
          ClusterRoleBindingModel.plural,
          null,
          'delete',
          getName(clusterRoleBinding),
          getNamespace(clusterRoleBinding),
          cluster,
        )) as AccessReview
      )?.status?.allowed;

    if (canDeleteCRB) {
      await kubevirtK8sDelete({
        cluster,
        model: ClusterRoleBindingModel,
        resource: clusterRoleBinding,
      });
    } else {
      await kubevirtK8sPatch({
        cluster,
        data: [{ op: 'replace', path: '/subjects', value: remainingSubjects }],
        model: ClusterRoleBindingModel,
        resource: clusterRoleBinding,
      });
    }
  } catch (err) {
    kubevirtConsole.log('Failed to remove permissions: ', (err as Error)?.message);
  }
};

export const installOrRemoveCheckupsStoragePermissions = (
  namespace: string,
  cluster: string,
  isPermitted: boolean,
  clusterRoleBinding: IoK8sApiRbacV1ClusterRoleBinding,
): Promise<void> =>
  isPermitted
    ? removePermissions(namespace, cluster, clusterRoleBinding)
    : installStorageCheckupPermissions(namespace, cluster, clusterRoleBinding);
