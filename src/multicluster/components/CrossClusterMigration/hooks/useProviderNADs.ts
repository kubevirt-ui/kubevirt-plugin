import { NetworkAttachmentDefinitionModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import {
  DEFAULT_NAMESPACE,
  OPENSHIFT_MULTUS_NS,
  OPENSHIFT_SRIOV_NETWORK_OPERATOR_NS,
} from '@kubevirt-utils/constants/constants';
import { modelToGroupVersionKind } from '@kubevirt-utils/models';
import { type NetworkAttachmentDefinitionKind } from '@kubevirt-utils/resources/nad/types';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';

const useProviderNADs = (
  targetCluster: string,
  namespace: string,
): { data: NetworkAttachmentDefinitionKind[]; error: Error; loaded: boolean } => {
  const [namespaceNADs, namespaceNADsLoaded, namespaceNADsError] = useK8sWatchData<
    NetworkAttachmentDefinitionKind[]
  >({
    cluster: targetCluster,
    groupVersionKind: modelToGroupVersionKind(NetworkAttachmentDefinitionModel),
    isList: true,
    namespace,
  });

  const [defaultNADs, defaultNADsLoaded] = useK8sWatchData<NetworkAttachmentDefinitionKind[]>({
    cluster: targetCluster,
    groupVersionKind: modelToGroupVersionKind(NetworkAttachmentDefinitionModel),
    isList: true,
    namespace: DEFAULT_NAMESPACE,
  });

  const [multusNADs, multusNADsLoaded] = useK8sWatchData<NetworkAttachmentDefinitionKind[]>({
    cluster: targetCluster,
    groupVersionKind: modelToGroupVersionKind(NetworkAttachmentDefinitionModel),
    isList: true,
    namespace: OPENSHIFT_MULTUS_NS,
  });

  const [sriovNADs, sriovNADsLoaded] = useK8sWatchData<NetworkAttachmentDefinitionKind[]>({
    cluster: targetCluster,
    groupVersionKind: modelToGroupVersionKind(NetworkAttachmentDefinitionModel),
    isList: true,
    namespace: OPENSHIFT_SRIOV_NETWORK_OPERATOR_NS,
  });

  const data = [...namespaceNADs, ...defaultNADs, ...multusNADs, ...sriovNADs];
  const loaded = namespaceNADsLoaded && defaultNADsLoaded && multusNADsLoaded && sriovNADsLoaded;

  return { data, error: namespaceNADsError, loaded };
};

export default useProviderNADs;
