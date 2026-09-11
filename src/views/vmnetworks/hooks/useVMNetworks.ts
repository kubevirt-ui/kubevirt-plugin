import { useMemo } from 'react';

import { ClusterUserDefinedNetworkModelGroupVersionKind } from '@kubevirt-utils/models';
import { UDNTopology } from '@kubevirt-utils/resources/udn/constants';
import { getNetwork } from '@kubevirt-utils/resources/udn/selectors';
import { type ClusterUserDefinedNetworkKind } from '@kubevirt-utils/resources/udn/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

import { toWatchError } from '../utils';

const useVMNetworks = (): [ClusterUserDefinedNetworkKind[], boolean, Error | undefined] => {
  const watchResult = useK8sWatchResource<ClusterUserDefinedNetworkKind[]>({
    groupVersionKind: ClusterUserDefinedNetworkModelGroupVersionKind,
    isList: true,
    namespaced: false,
  });
  const resources = watchResult[0];
  const loaded = watchResult[1];
  const error = toWatchError(watchResult[2]);

  const vmNetworks = useMemo(
    () => resources?.filter((resource) => getNetwork(resource).topology === UDNTopology.Localnet),
    [resources],
  );

  return [vmNetworks, loaded, error];
};

export default useVMNetworks;
