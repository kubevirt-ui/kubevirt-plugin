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
  IoK8sApiCoreV1ServiceAccount,
  IoK8sApiRbacV1ClusterRoleBinding,
  IoK8sApiRbacV1Role,
  IoK8sApiRbacV1RoleBinding,
} from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import useActiveNamespace from '@kubevirt-utils/hooks/useActiveNamespace';
import useKubevirtWatchResource from '@kubevirt-utils/hooks/useKubevirtWatchResource/useKubevirtWatchResource';
import useSelectedCluster from '@kubevirt-utils/hooks/useSelectedCluster';
import { useFleetAccessReview } from '@stolostron/multicluster-sdk';

import {
  SELF_VALIDATION_CLUSTER_ROLE_BINDING,
  SELF_VALIDATION_ROLE,
  SELF_VALIDATION_SA,
} from '../../utils';

const useCheckupsSelfValidationPermissions = () => {
  const namespace = useActiveNamespace();
  const cluster = useSelectedCluster();
  const isAllNamespace = namespace === ALL_NAMESPACES_SESSION_KEY;

  // Use the public useFleetAccessReview hook to check ClusterRoleBinding create permission.
  // Passes cluster so the SAR targets the correct managed cluster.
  const [canCreateClusterRoleBinding, checkingPermissions] = useFleetAccessReview({
    cluster,
    group: ClusterRoleBindingModel.apiGroup,
    resource: ClusterRoleBindingModel.plural,
    verb: 'create',
  });

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

  const [roleBindings, roleBindingsLoaded, roleBindingsError] = useKubevirtWatchResource<
    IoK8sApiRbacV1RoleBinding[]
  >(
    !isAllNamespace && {
      cluster,
      groupVersionKind: modelToGroupVersionKind(RoleBindingModel),
      isList: true,
      namespace,
    },
  );

  const [clusterRoleBindings, clusterRoleBindingsLoaded, clusterRoleBindingsError] =
    useKubevirtWatchResource<IoK8sApiRbacV1ClusterRoleBinding[]>(
      !isAllNamespace && {
        cluster,
        groupVersionKind: modelToGroupVersionKind(ClusterRoleBindingModel),
        isList: true,
      },
    );

  const clusterRoleBinding = useMemo(() => {
    const crb = findObjectByName(clusterRoleBindings, SELF_VALIDATION_CLUSTER_ROLE_BINDING);
    const hasSubjectForNamespace = crb?.subjects?.some(
      (subject) =>
        subject?.kind === ServiceAccountModel.kind &&
        subject?.name === SELF_VALIDATION_SA &&
        subject?.namespace === namespace,
    );
    return hasSubjectForNamespace ? crb : undefined;
  }, [clusterRoleBindings, namespace]);

  const isServiceAccount = useMemo(
    () => findObjectByName(serviceAccounts, SELF_VALIDATION_SA),
    [serviceAccounts],
  );

  const isRole = useMemo(() => findObjectByName(roles, SELF_VALIDATION_ROLE), [roles]);

  // Validate that the RoleBinding both targets the expected Role and includes the expected SA.
  const isRoleBinding = useMemo(() => {
    const rb = findObjectByName(roleBindings, SELF_VALIDATION_ROLE);
    const bindsExpectedRole =
      rb?.roleRef?.kind === RoleModel.kind && rb?.roleRef?.name === SELF_VALIDATION_ROLE;
    const bindsExpectedSA = rb?.subjects?.some(
      (subject) =>
        subject?.kind === ServiceAccountModel.kind &&
        subject?.name === SELF_VALIDATION_SA &&
        subject?.namespace === namespace,
    );
    return bindsExpectedRole && bindsExpectedSA ? rb : undefined;
  }, [roleBindings, namespace]);

  return {
    clusterRoleBinding,
    isPermitted: Boolean(isServiceAccount && isRole && isRoleBinding && clusterRoleBinding),
    isPermittedToInstall: !isAllNamespace && canCreateClusterRoleBinding,
    loadError:
      serviceAccountsError || rolesError || roleBindingsError || clusterRoleBindingsError || null,
    loading:
      checkingPermissions ||
      !serviceAccountsLoaded ||
      !rolesLoaded ||
      !roleBindingsLoaded ||
      !clusterRoleBindingsLoaded,
  };
};

export default useCheckupsSelfValidationPermissions;
