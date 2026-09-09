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

  const [serviceAccounts, serviceAccountsLoaded] = useKubevirtWatchResource<
    IoK8sApiCoreV1ServiceAccount[]
  >(
    !isAllNamespace && {
      cluster,
      groupVersionKind: modelToGroupVersionKind(ServiceAccountModel),
      isList: true,
      namespace,
    },
  );

  const [roles, rolesLoaded] = useKubevirtWatchResource<IoK8sApiRbacV1Role[]>(
    !isAllNamespace && {
      cluster,
      groupVersionKind: modelToGroupVersionKind(RoleModel),
      isList: true,
      namespace,
    },
  );

  const [clusterRoleBinding, loadedClusterRoleBinding] = useKubevirtWatchResource<
    IoK8sApiRbacV1ClusterRoleBinding[]
  >(
    !isAllNamespace && {
      cluster,
      groupVersionKind: modelToGroupVersionKind(ClusterRoleBindingModel),
      isList: true,
    },
  );

  const [roleBinding, rolesBindingLoaded] = useKubevirtWatchResource<IoK8sApiRbacV1RoleBinding[]>(
    !isAllNamespace && {
      cluster,
      groupVersionKind: modelToGroupVersionKind(RoleBindingModel),
      isList: true,
      namespace,
    },
  );

  const isClusterRoleBinding = useMemo(() => {
    const crb = findObjectByName(clusterRoleBinding, STORAGE_CLUSTER_ROLE_BINDING);
    const hasSubjectMatchingNS = crb?.subjects?.find((subject) => subject?.namespace === namespace);
    return hasSubjectMatchingNS && crb;
  }, [clusterRoleBinding, namespace]);

  const isConfigMapRole = useMemo(() => findObjectByName(roles, STORAGE_CHECKUP_ROLE), [roles]);

  const isConfigMapRoleBinding = useMemo(
    () => findObjectByName(roleBinding, STORAGE_CHECKUP_ROLE),
    [roleBinding],
  );

  const isServiceAccount = useMemo(
    () => findObjectByName(serviceAccounts, STORAGE_CHECKUP_SA),
    [serviceAccounts],
  );

  return {
    clusterRoleBinding: isClusterRoleBinding,
    isPermitted: Boolean(
      isServiceAccount && isConfigMapRole && isConfigMapRoleBinding && isClusterRoleBinding,
    ),
    isPermittedToInstall: !isEmpty(clusterRoleBinding),
    loading:
      !serviceAccountsLoaded && !rolesLoaded && !rolesBindingLoaded && !loadedClusterRoleBinding,
  };
};
