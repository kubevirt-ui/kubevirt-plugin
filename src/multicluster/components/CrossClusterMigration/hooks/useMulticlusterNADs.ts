import { useMemo } from 'react';

import { NetworkAttachmentDefinition } from '@kubevirt-utils/components/NetworkInterfaceModal/components/hooks/types';
import useNADListPermissions from '@kubevirt-utils/components/NetworkInterfaceModal/components/hooks/useNADListPermissions';
import {
  DEFAULT_NAMESPACE,
  OPENSHIFT_MULTUS_NS,
  OPENSHIFT_SRIOV_NETWORK_OPERATOR_NS,
} from '@kubevirt-utils/constants/constants';
import { NetworkAttachmentDefinitionModelGroupVersionKind } from '@kubevirt-utils/models';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';

const useMulticlusterNADs = (cluster: string, namespace: string) => {
  const nadListPermissionsMap = useNADListPermissions();

  const [namespaceNADs, namespaceNADsLoaded, namespaceNADsError] = useK8sWatchData<
    NetworkAttachmentDefinition[]
  >({
    cluster: cluster,
    groupVersionKind: NetworkAttachmentDefinitionModelGroupVersionKind,
    isList: true,
    namespace: namespace,
  });

  const [defaultNADs, defaultNADsLoaded, defaultNADsError] = useK8sWatchData<
    NetworkAttachmentDefinition[]
  >(
    nadListPermissionsMap.default && namespace !== DEFAULT_NAMESPACE
      ? {
          cluster: cluster,
          groupVersionKind: NetworkAttachmentDefinitionModelGroupVersionKind,
          isList: true,
          namespace: namespace,
        }
      : null,
  );

  const [openshiftMultusNADs, openshiftMultusNADsLoaded, openshiftMultusNADsError] =
    useK8sWatchData<NetworkAttachmentDefinition[]>(
      nadListPermissionsMap.OPENSHIFT_MULTUS_NS && namespace !== OPENSHIFT_MULTUS_NS
        ? {
            cluster: cluster,
            groupVersionKind: NetworkAttachmentDefinitionModelGroupVersionKind,
            isList: true,
            namespace: namespace,
          }
        : null,
    );

  const [
    openshiftSriovNetworkOperatorNADs,
    openshiftSriovNetworkOperatorNADsLoaded,
    openshiftSriovNetworkOperatorNADsError,
  ] = useK8sWatchData<NetworkAttachmentDefinition[]>(
    nadListPermissionsMap.OPENSHIFT_SRIOV_NETWORK_OPERATOR_NS &&
      namespace !== OPENSHIFT_SRIOV_NETWORK_OPERATOR_NS
      ? {
          cluster: cluster,
          groupVersionKind: NetworkAttachmentDefinitionModelGroupVersionKind,
          isList: true,
          namespace: namespace,
        }
      : null,
  );

  const data = useMemo(() => {
    return [
      ...(namespaceNADs || []),
      ...(defaultNADs || []),
      ...(openshiftMultusNADs || []),
      ...(openshiftSriovNetworkOperatorNADs || []),
    ];
  }, [namespaceNADs, defaultNADs, openshiftMultusNADs, openshiftSriovNetworkOperatorNADs]);

  return {
    data,
    error:
      namespaceNADsError ||
      defaultNADsError ||
      openshiftMultusNADsError ||
      openshiftSriovNetworkOperatorNADsError,
    loaded:
      namespaceNADsLoaded &&
      defaultNADsLoaded &&
      openshiftMultusNADsLoaded &&
      openshiftSriovNetworkOperatorNADsLoaded,
  };
};

export default useMulticlusterNADs;
