import { useMemo } from 'react';
import { findObjectByName } from 'src/views/checkups/utils/utils';

import {
  ClusterRoleBindingModel,
  modelToGroupVersionKind,
  RoleBindingModel,
  RoleModel,
  ServiceAccountModel,
} from '@kubevirt-ui/kubevirt-api/console';
import {
  IoK8sApiCoreV1ServiceAccount,
  IoK8sApiRbacV1ClusterRole,
  IoK8sApiRbacV1ClusterRoleBinding,
} from '@kubevirt-ui/kubevirt-api/kubernetes';
import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import useKubevirtWatchResource from '@kubevirt-utils/hooks/useKubevirtWatchResource/useKubevirtWatchResource';
import useListClusters from '@kubevirt-utils/hooks/useListClusters';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';
import { useHubClusterName } from '@stolostron/multicluster-sdk';

import {
  STORAGE_CHECKUP_ROLE,
  STORAGE_CHECKUP_SA,
  STORAGE_CLUSTER_ROLE_BINDING,
} from '../../utils/utils';

export const useCheckupsStoragePermissions = () => {
  const [namespace] = useActiveNamespace();
  const selectedClusters = useListClusters();
  const [hubClusterName] = useHubClusterName();
  const cluster = selectedClusters?.[0] || hubClusterName;
  const isAllNamespace = namespace === ALL_NAMESPACES_SESSION_KEY;

  const [serviceAccounts, loadingServiceAccounts] = useKubevirtWatchResource<
    IoK8sApiCoreV1ServiceAccount[]
  >(
    !isAllNamespace && {
      cluster,
      groupVersionKind: modelToGroupVersionKind(ServiceAccountModel),
      isList: true,
      namespace,
    },
  );

  const [roles, loadingRoles] = useKubevirtWatchResource<IoK8sApiRbacV1ClusterRole[]>(
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

  const [roleBinding, loadingRolesBinding] = useKubevirtWatchResource<
    IoK8sApiRbacV1ClusterRoleBinding[]
  >(
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
      !loadingServiceAccounts && !loadingRoles && !loadingRolesBinding && !loadedClusterRoleBinding,
  };
};
