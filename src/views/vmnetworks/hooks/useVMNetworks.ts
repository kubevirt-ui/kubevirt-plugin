import { useMemo } from 'react';

import { ClusterUserDefinedNetworkModelGroupVersionKind } from '@kubevirt-utils/models';
import { UDNTopology } from '@kubevirt-utils/resources/udn/constants';
import { getNetwork } from '@kubevirt-utils/resources/udn/selectors';
import { ClusterUserDefinedNetworkKind } from '@kubevirt-utils/resources/udn/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

const useVMNetworks = (): [ClusterUserDefinedNetworkKind[], boolean, Error] => {
  const [resources, loaded, error] = useK8sWatchResource<ClusterUserDefinedNetworkKind[]>({
    groupVersionKind: ClusterUserDefinedNetworkModelGroupVersionKind,
    isList: true,
    namespaced: false,
  });

  const vmNetworks = useMemo(
    () => resources?.filter((resource) => getNetwork(resource).topology === UDNTopology.Localnet),
    [resources],
  );

  return [vmNetworks, loaded, error];
};

export default useVMNetworks;
