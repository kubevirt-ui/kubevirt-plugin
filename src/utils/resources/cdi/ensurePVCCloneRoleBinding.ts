import {
  ClusterRoleModel,
  RoleBindingModel,
  UserModel,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import { type IoK8sApiRbacV1RoleBinding } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { checkAccessForFleet } from '@kubevirt-utils/components/LazyActionMenu/overrides';
import { getName } from '@kubevirt-utils/resources/shared';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { kubevirtK8sCreate, kubevirtK8sGet } from '@multicluster/k8sRequests';
import {
  checkAccess,
  type SelfSubjectAccessReviewKind,
} from '@openshift-console/dynamic-plugin-sdk';

import { CDI_CLONER_CLUSTER_ROLE, CDI_CLONER_ROLE_BINDING_PREFIX } from './constants';

const getErrorStatusCode = (error: unknown): number | undefined => {
  const err = error as { code?: number; response?: { status?: number } };
  return err?.response?.status ?? err?.code;
};

const isErrorStatusCode = (error: unknown, statusCode: number): boolean =>
  getErrorStatusCode(error) === statusCode;

const getRoleBindingName = (username: string): string =>
  `${CDI_CLONER_ROLE_BINDING_PREFIX}${username.replace(/[^a-z0-9-]/gi, '-').toLowerCase()}`.slice(
    0,
    63,
  );

const buildRoleBinding = (
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

/**
 * Binds the current user to the CDI `cdi-cloner` ClusterRole in the source namespace.
 * Returns true when the RoleBinding exists or was created successfully.
 */
export const ensurePVCCloneRoleBinding = async (
  sourceNamespace: string,
  cluster?: string,
  isACMPage?: boolean,
): Promise<boolean> => {
  const checkAccessDelegate = cluster && isACMPage ? checkAccessForFleet : checkAccess;

  const roleBindingAccess = (await checkAccessDelegate({
    ...(cluster ? { cluster } : {}),
    group: RoleBindingModel.apiGroup,
    namespace: sourceNamespace,
    resource: RoleBindingModel.plural,
    verb: 'create',
  })) as SelfSubjectAccessReviewKind;

  if (!roleBindingAccess?.status?.allowed) {
    return false;
  }

  let username: string | undefined;
  try {
    const user = await kubevirtK8sGet({ cluster, model: UserModel, name: '~' });
    username = getName(user);
  } catch (error) {
    kubevirtConsole.warn('Failed to resolve current user for CDI clone RoleBinding', error);
    return false;
  }

  if (!username) {
    return false;
  }

  const roleBindingName = getRoleBindingName(username);

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
      data: buildRoleBinding(roleBindingName, sourceNamespace, username),
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
