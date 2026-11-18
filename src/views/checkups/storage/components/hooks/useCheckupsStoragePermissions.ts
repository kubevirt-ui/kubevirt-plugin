import { useMemo } from 'react';
import { findObjectByName } from 'src/views/checkups/utils/utils';

import {
  ClusterRoleBindingModel,
  modelToGroupVersionKind,
  RoleBindingModel,
  RoleModel,
  ServiceAccountModel,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import {
  type IoK8sApiCoreV1ServiceAccount,
  type IoK8sApiRbacV1ClusterRoleBinding,
  type IoK8sApiRbacV1Role,
  type IoK8sApiRbacV1RoleBinding,
} from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import useActiveNamespace from '@kubevirt-utils/hooks/useActiveNamespace';
import useKubevirtWatchResource from '@kubevirt-utils/hooks/useKubevirtWatchResource/useKubevirtWatchResource';
import useSelectedCluster from '@kubevirt-utils/hooks/useSelectedCluster';
import { isEmpty } from '@kubevirt-utils/utils/utils';

import {
  STORAGE_CHECKUP_ROLE,
  STORAGE_CHECKUP_SA,
  STORAGE_CLUSTER_ROLE_BINDING,
} from '../../utils/consts';

type UseCheckupsStoragePermissionsResult = {
  clusterRoleBinding: IoK8sApiRbacV1ClusterRoleBinding | undefined;
  isPermitted: boolean;
  isPermittedToInstall: boolean;
  loading: boolean;
};

export const useCheckupsStoragePermissions = (): UseCheckupsStoragePermissionsResult => {
  const namespace = useActiveNamespace();
  const cluster = useSelectedCluster();
  const isAllNamespace = namespace === ALL_NAMESPACES_SESSION_KEY;

  const [serviceAccounts, serviceAccountsLoaded, serviceAccountsError] = useKubevirtWatchResource<
    IoK8sApiCoreV1ServiceAccount[]
  >(
    !isAllNamespace && {
      cluster,
      groupVersionKind: modelToGroupVersionKind(ServiceAccountModel),
      isList: true,
      namespace,
    },
  );

  const [roles, rolesLoaded, rolesError] = useKubevirtWatchResource<IoK8sApiRbacV1Role[]>(
    !isAllNamespace && {
      cluster,
      groupVersionKind: modelToGroupVersionKind(RoleModel),
      isList: true,
      namespace,
    },
  );

  const [clusterRoleBindings, loadedClusterRoleBinding, clusterRoleBindingsError] =
    useKubevirtWatchResource<IoK8sApiRbacV1ClusterRoleBinding[]>(
      !isAllNamespace && {
        cluster,
        groupVersionKind: modelToGroupVersionKind(ClusterRoleBindingModel),
        isList: true,
      },
    );

  const [roleBinding, rolesBindingLoaded, roleBindingError] = useKubevirtWatchResource<
    IoK8sApiRbacV1RoleBinding[]
  >(
    !isAllNamespace && {
      cluster,
      groupVersionKind: modelToGroupVersionKind(RoleBindingModel),
      isList: true,
      namespace,
    },
  );

  // Raw ClusterRoleBinding found by name (not gated on this namespace's subject), so the install
  // knows the shared CRB already exists and must be appended to instead of recreated.
  const storageClusterRoleBindingResource = useMemo(
    () => findObjectByName(clusterRoleBindings, STORAGE_CLUSTER_ROLE_BINDING),
    [clusterRoleBindings],
  );

  const hasClusterRoleBindingSubject = useMemo(
    () =>
      Boolean(
        storageClusterRoleBindingResource?.subjects?.some(
          (subject) => subject?.namespace === namespace,
        ),
      ),
    [storageClusterRoleBindingResource, namespace],
  );

  const isConfigMapRole = useMemo(() => findObjectByName(roles, STORAGE_CHECKUP_ROLE), [roles]);

  const isConfigMapRoleBinding = useMemo(
    () => findObjectByName(roleBinding, STORAGE_CHECKUP_ROLE),
    [roleBinding],
  );

  const isServiceAccount = useMemo(
    () => findObjectByName(serviceAccounts, STORAGE_CHECKUP_SA),
    [serviceAccounts],
  );

  // A watch that errored (e.g. no permission to list ClusterRoleBindings) counts as settled,
  // so users without that permission do not get an endless loading state.
  const serviceAccountsSettled = serviceAccountsLoaded || !isEmpty(serviceAccountsError);
  const rolesSettled = rolesLoaded || !isEmpty(rolesError);
  const roleBindingsSettled = rolesBindingLoaded || !isEmpty(roleBindingError);
  const clusterRoleBindingsSettled = loadedClusterRoleBinding || !isEmpty(clusterRoleBindingsError);

  return {
    clusterRoleBinding: storageClusterRoleBindingResource,
    isPermitted: Boolean(
      isServiceAccount && isConfigMapRole && isConfigMapRoleBinding && hasClusterRoleBindingSubject,
    ),
    isPermittedToInstall: !isEmpty(clusterRoleBindings),
    loading: !(
      serviceAccountsSettled &&
      rolesSettled &&
      roleBindingsSettled &&
      clusterRoleBindingsSettled
    ),
  };
};
