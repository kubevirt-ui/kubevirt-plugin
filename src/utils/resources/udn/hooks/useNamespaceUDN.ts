import {
  ClusterUserDefinedNetworkModelGroupVersionKind,
  modelToGroupVersionKind,
  ProjectModel,
  UserDefinedNetworkModelGroupVersionKind,
} from '@kubevirt-utils/models';
import {
  ClusterUserDefinedNetworkKind,
  UserDefinedNetworkKind,
  UserDefinedNetworkRole,
} from '@kubevirt-utils/resources/udn/types';
import { matchSelector } from '@kubevirt-utils/utils/matchSelector';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { K8sResourceCommon, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

const useNamespaceUDN = (
  namespace: string,
): [
  isNamespaceManagedByUDN: boolean,
  udn: ClusterUserDefinedNetworkKind | UserDefinedNetworkKind,
] => {
  const [project] = useK8sWatchResource<K8sResourceCommon>({
    groupVersionKind: modelToGroupVersionKind(ProjectModel),
    name: namespace,
  });

  const [udns] = useK8sWatchResource<UserDefinedNetworkKind[]>({
    groupVersionKind: UserDefinedNetworkModelGroupVersionKind,
    isList: true,
    namespace,
  });

  const [clusterUDNs] = useK8sWatchResource<ClusterUserDefinedNetworkKind[]>({
    groupVersionKind: ClusterUserDefinedNetworkModelGroupVersionKind,
    isList: true,
  });

  const primaryUDN = udns?.find(
    (udn) => udn?.spec?.layer2?.role === UserDefinedNetworkRole.Primary,
  );

  const primaryClustersUDNs = clusterUDNs
    ?.filter((clusterUDN) => matchSelector(project, clusterUDN?.spec?.namespaceSelector))
    ?.find((udn) => udn?.spec?.network?.layer2?.role === UserDefinedNetworkRole.Primary);

  const isNamespaceManagedByUDN = !isEmpty(primaryUDN || primaryClustersUDNs);

  return [isNamespaceManagedByUDN, primaryUDN || primaryClustersUDNs];
};

export default useNamespaceUDN;
