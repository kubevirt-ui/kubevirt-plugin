import { useEffect, useState } from 'react';

import {
  ClusterRoleBindingModel,
  modelToGroupVersionKind,
  ServiceAccountModel,
} from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiRbacV1ClusterRoleBinding } from '@kubevirt-ui/kubevirt-api/kubernetes';
import useActiveNamespace from '@kubevirt-utils/hooks/useActiveNamespace';
import useKubevirtWatchResource from '@kubevirt-utils/hooks/useKubevirtWatchResource/useKubevirtWatchResource';
import useListClusters from '@kubevirt-utils/hooks/useListClusters';
import { useHubClusterName } from '@stolostron/multicluster-sdk';
import { checkAccess } from '@stolostron/multicluster-sdk/lib/internal/checkAccess';

import { SELF_VALIDATION_CLUSTER_ROLE_BINDING, SELF_VALIDATION_SA } from '../../utils';

const useCheckupsSelfValidationPermissions = () => {
  const namespace = useActiveNamespace();
  const [canCreateClusterRoleBinding, setCanCreateClusterRoleBinding] = useState<boolean>(false);
  const [checkingPermissions, setCheckingPermissions] = useState<boolean>(true);
  const selectedClusters = useListClusters();
  const [hubClusterName] = useHubClusterName();
  const cluster = selectedClusters?.[0] || hubClusterName;

  const [clusterRoleBindings, loadedClusterRoleBinding] = useKubevirtWatchResource<
    IoK8sApiRbacV1ClusterRoleBinding[]
  >({
    cluster,
    groupVersionKind: modelToGroupVersionKind(ClusterRoleBindingModel),
    isList: true,
  });

  const clusterRoleBinding = clusterRoleBindings?.find(
    (crb) => crb.metadata.name === SELF_VALIDATION_CLUSTER_ROLE_BINDING,
  );

  const isPermitted = clusterRoleBinding?.subjects?.some(
    (subject) =>
      subject?.kind === ServiceAccountModel.kind &&
      subject?.name === SELF_VALIDATION_SA &&
      subject?.namespace === namespace,
  );

  // Check if user has cluster-admin permissions (can create ClusterRoleBindings)
  useEffect(() => {
    setCheckingPermissions(true);
    checkAccess(
      ClusterRoleBindingModel.apiGroup,
      ClusterRoleBindingModel.plural,
      null,
      'create',
      null,
      null,
      cluster,
    )
      .then((result) => {
        setCanCreateClusterRoleBinding(Boolean(result?.status?.allowed));
      })
      .catch(() => {
        // If checkAccess fails (e.g., API unavailable, network error), default to true
        // to allow the user to attempt installation. Kubernetes will enforce permissions
        // when they actually try to create the ClusterRoleBinding, and installPermissions
        // will handle any permission errors gracefully.
        setCanCreateClusterRoleBinding(true);
      })
      .finally(() => {
        setCheckingPermissions(false);
      });
  }, [cluster]);

  // Only allow installation if user has cluster-admin permissions (can create ClusterRoleBindings)
  // The checkup requires cluster-admin access according to the documentation
  const isPermittedToInstall = canCreateClusterRoleBinding;

  return {
    clusterRoleBinding,
    isPermitted: !!isPermitted,
    isPermittedToInstall,
    loading: !loadedClusterRoleBinding || checkingPermissions,
  };
};

export default useCheckupsSelfValidationPermissions;
