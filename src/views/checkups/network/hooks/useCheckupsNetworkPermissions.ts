import { useMemo } from 'react';

import {
  ClusterRoleBindingModel,
  ClusterRoleModel,
  modelToGroupVersionKind,
  ServiceAccountModel,
} from '@kubevirt-ui/kubevirt-api/console';
import {
  IoK8sApiCoreV1ServiceAccount,
  IoK8sApiRbacV1ClusterRole,
  IoK8sApiRbacV1ClusterRoleBinding,
} from '@kubevirt-ui/kubevirt-api/kubernetes';
import useKubevirtWatchResource from '@kubevirt-utils/hooks/useKubevirtWatchResource/useKubevirtWatchResource';
import useListClusters from '@kubevirt-utils/hooks/useListClusters';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';
import { useHubClusterName } from '@stolostron/multicluster-sdk';

import { findObjectByName } from '../../utils/utils';
import {
  KIAGNOSE_CONFIGMAP_ACCESS,
  KUBEVIRT_VM_LATENCY_CHECKER,
  VM_LATENCY_CHECKUP_SA,
} from '../utils/utils';

const useCheckupsNetworkPermissions = (): { isPermitted: boolean; loading: boolean } => {
  const [namespace] = useActiveNamespace();
  const selectedClusters = useListClusters();
  const [hubClusterName] = useHubClusterName();
  const cluster = selectedClusters?.[0] || hubClusterName;

  const [serviceAccounts, loadingServiceAccounts] = useKubevirtWatchResource<
    IoK8sApiCoreV1ServiceAccount[]
  >({
    cluster,
    groupVersionKind: modelToGroupVersionKind(ServiceAccountModel),
    isList: true,
    namespace,
  });

  const [roles, loadingRoles] = useKubevirtWatchResource<IoK8sApiRbacV1ClusterRole[]>({
    cluster,
    groupVersionKind: modelToGroupVersionKind(ClusterRoleModel),
    isList: true,
  });

  const [roleBinding, loadingRolesBinding] = useKubevirtWatchResource<
    IoK8sApiRbacV1ClusterRoleBinding[]
  >({
    cluster,
    groupVersionKind: modelToGroupVersionKind(ClusterRoleBindingModel),
    isList: true,
  });
  const isLatencyRole = useMemo(
    () => findObjectByName(roles, KUBEVIRT_VM_LATENCY_CHECKER),
    [roles],
  );

  const isConfigMapRole = useMemo(
    () => findObjectByName(roles, KIAGNOSE_CONFIGMAP_ACCESS),
    [roles],
  );

  const isLatencyRoleBinding = useMemo(
    () => findObjectByName(roleBinding, KUBEVIRT_VM_LATENCY_CHECKER),
    [roleBinding],
  );

  const isConfigMapRoleBinding = useMemo(
    () => findObjectByName(roleBinding, KIAGNOSE_CONFIGMAP_ACCESS),
    [roleBinding],
  );

  const isServiceAccount = useMemo(
    () => findObjectByName(serviceAccounts, VM_LATENCY_CHECKUP_SA),
    [serviceAccounts],
  );

  return {
    isPermitted: Boolean(
      isServiceAccount &&
        isLatencyRole &&
        isConfigMapRole &&
        isLatencyRoleBinding &&
        isConfigMapRoleBinding,
    ),
    loading: !loadingServiceAccounts && !loadingRoles && !loadingRolesBinding,
  };
};

export default useCheckupsNetworkPermissions;
