import { ClusterRoleModel, RoleBindingModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type IoK8sApiRbacV1RoleBinding } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { kubevirtK8sCreate, kubevirtK8sGet } from '@multicluster/k8sRequests';

import {
  buildRoleBindingCreateAccessReview,
  checkCloneSourceAccess,
  getCheckAccessDelegate,
} from './accessReview';
import { CDI_CLONER_CLUSTER_ROLE, CDI_CLONER_ROLE_BINDING_PREFIX } from './constants';
import { getCurrentUserName } from './getCurrentUserName';
import { isErrorStatusCode } from './k8sErrors';

/** Deterministic per-user name so repeat visits reuse the same RoleBinding. */
export const getCdiClonerRoleBindingName = (username: string): string =>
  `${CDI_CLONER_ROLE_BINDING_PREFIX}${username.replace(/[^a-z0-9-]/gi, '-').toLowerCase()}`.slice(
    0,
    63,
  );

export const buildCdiClonerRoleBinding = (
  roleBindingName: string,
  sourceNamespace: string,
  username: string,
): IoK8sApiRbacV1RoleBinding => ({
  apiVersion: 'rbac.authorization.k8s.io/v1',
  kind: RoleBindingModel.kind,
  metadata: {
    name: roleBindingName,
    namespace: sourceNamespace,
  },
  roleRef: {
    apiGroup: ClusterRoleModel.apiGroup,
    kind: ClusterRoleModel.kind,
    name: CDI_CLONER_CLUSTER_ROLE,
  },
  subjects: [
    {
      apiGroup: ClusterRoleModel.apiGroup,
      kind: 'User',
      name: username,
    },
  ],
});

type EnsureCdiClonerRoleBindingParams = {
  cluster?: string;
  isACMPage?: boolean;
  sourceNamespace: string;
};

export const ensureCdiClonerRoleBinding = async ({
  cluster,
  isACMPage,
  sourceNamespace,
}: EnsureCdiClonerRoleBindingParams): Promise<boolean> => {
  const checkAccessDelegate = getCheckAccessDelegate(cluster, isACMPage);

  const canCreateRoleBinding = await checkCloneSourceAccess(
    checkAccessDelegate,
    buildRoleBindingCreateAccessReview(sourceNamespace, cluster),
  );

  if (!canCreateRoleBinding) {
    return false;
  }

  const username = await getCurrentUserName(cluster);
  if (!username) {
    return false;
  }

  const roleBindingName = getCdiClonerRoleBindingName(username);

  try {
    await kubevirtK8sGet({
      cluster,
      model: RoleBindingModel,
      name: roleBindingName,
      ns: sourceNamespace,
    });
    return true;
  } catch (error) {
    if (!isErrorStatusCode(error, 404)) {
      kubevirtConsole.warn('Failed to get CDI cloner RoleBinding', error);
      return false;
    }
  }

  try {
    await kubevirtK8sCreate({
      cluster,
      data: buildCdiClonerRoleBinding(roleBindingName, sourceNamespace, username),
      model: RoleBindingModel,
    });
    return true;
  } catch (error) {
    if (isErrorStatusCode(error, 409)) {
      return true;
    }
    kubevirtConsole.warn('Failed to create CDI cloner RoleBinding', error);
    return false;
  }
};
