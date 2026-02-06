import { useMemo } from 'react';

import {
  ClusterUserDefinedNetworkModelGroupVersionKind,
  NetworkAttachmentDefinitionModelGroupVersionKind,
  UserDefinedNetworkModelGroupVersionKind,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import {
  ClusterUserDefinedNetworkKind,
  UserDefinedNetworkKind,
} from '@kubevirt-utils/resources/udn/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { NetworkAttachmentDefinitionKind } from '@overview/OverviewTab/inventory-card/utils/types';

import { VALID_OTHER_VM_NETWORK_TYPES } from '../constants';
import { OtherVMNetwork, OtherVMNetworkWithType } from '../types';
import { getVMNetworkType, hasUDNOwner } from '../utils';

const useOtherVMNetworks = (): [OtherVMNetworkWithType[], boolean, Error] => {
  const [cudns, cudnsLoaded, cudnsError] = useK8sWatchResource<ClusterUserDefinedNetworkKind[]>({
    groupVersionKind: ClusterUserDefinedNetworkModelGroupVersionKind,
    isList: true,
  });

  const [udns, udnsLoaded, udnsError] = useK8sWatchResource<UserDefinedNetworkKind[]>({
    groupVersionKind: UserDefinedNetworkModelGroupVersionKind,
    isList: true,
  });

  const [nads, nadsLoaded, nadsError] = useK8sWatchResource<NetworkAttachmentDefinitionKind[]>({
    groupVersionKind: NetworkAttachmentDefinitionModelGroupVersionKind,
    isList: true,
  });

  const otherVMNetworksWithType: OtherVMNetworkWithType[] = useMemo(() => {
    const nadsWithoutUDN = nads?.filter((nad) => !hasUDNOwner(nad));

    const otherVMNetworks: OtherVMNetwork[] = [
      ...(cudns ?? []),
      ...(udns ?? []),
      ...(nadsWithoutUDN ?? []),
    ];

    return otherVMNetworks
      .map((network) => ({
        ...network,
        type: getVMNetworkType(network),
      }))
      .filter((network) => VALID_OTHER_VM_NETWORK_TYPES.has(network.type));
  }, [cudns, nads, udns]);

  return [
    otherVMNetworksWithType,
    nadsLoaded && cudnsLoaded && udnsLoaded,
    nadsError || cudnsError || udnsError,
  ];
};

export default useOtherVMNetworks;
