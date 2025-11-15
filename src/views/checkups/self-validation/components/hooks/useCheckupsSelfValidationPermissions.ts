import {
  ClusterRoleBindingModel,
  modelToGroupVersionKind,
} from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiRbacV1ClusterRoleBinding } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { useActiveNamespace, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

import { SELF_VALIDATION_CLUSTER_ROLE_BINDING, SELF_VALIDATION_SA } from '../../utils';

const useCheckupsSelfValidationPermissions = () => {
  const [namespace] = useActiveNamespace();

  const [clusterRoleBindings, loadedClusterRoleBinding, loadErrorClusterRoleBinding] =
    useK8sWatchResource<IoK8sApiRbacV1ClusterRoleBinding[]>({
      groupVersionKind: modelToGroupVersionKind(ClusterRoleBindingModel),
      isList: true,
    });

  const clusterRoleBinding = clusterRoleBindings?.find(
    (crb) => crb.metadata.name === SELF_VALIDATION_CLUSTER_ROLE_BINDING,
  );

  const isPermitted = clusterRoleBinding?.subjects?.some(
    (subject) =>
      subject?.kind === 'ServiceAccount' &&
      subject?.name === SELF_VALIDATION_SA &&
      subject?.namespace === namespace,
  );

  // Always allow installation unless there's a critical error
  const isPermittedToInstall =
    !loadErrorClusterRoleBinding || loadErrorClusterRoleBinding?.code === 403;

  return {
    clusterRoleBinding,
    isPermitted: !!isPermitted,
    isPermittedToInstall,
    loading: !loadedClusterRoleBinding,
  };
};

export default useCheckupsSelfValidationPermissions;
