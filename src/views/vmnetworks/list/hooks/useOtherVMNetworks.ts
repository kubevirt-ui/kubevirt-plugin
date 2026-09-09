import { useMemo } from 'react';

import {
  ClusterUserDefinedNetworkModelGroupVersionKind,
  NetworkAttachmentDefinitionModelGroupVersionKind,
  UserDefinedNetworkModelGroupVersionKind,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import { type NetworkAttachmentDefinitionKind } from '@kubevirt-utils/resources/nad/types';
import {
  type ClusterUserDefinedNetworkKind,
  type UserDefinedNetworkKind,
} from '@kubevirt-utils/resources/udn/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

import { VALID_OTHER_VM_NETWORK_TYPES } from '../constants';
import { type OtherVMNetwork, type OtherVMNetworkWithType } from '../types';
import { getVMNetworkType, hasUDNOwner } from '../utils';

import { toWatchError } from '../../utils';

const useOtherVMNetworks = (): [OtherVMNetworkWithType[], boolean, Error | undefined] => {
  const cudnsWatchResult = useK8sWatchResource<ClusterUserDefinedNetworkKind[]>({
    groupVersionKind: ClusterUserDefinedNetworkModelGroupVersionKind,
    isList: true,
  });
  const cudns = cudnsWatchResult[0];
  const cudnsLoaded = cudnsWatchResult[1];
  const cudnsError = toWatchError(cudnsWatchResult[2]);

  const udnsWatchResult = useK8sWatchResource<UserDefinedNetworkKind[]>({
    groupVersionKind: UserDefinedNetworkModelGroupVersionKind,
    isList: true,
  });
  const udns = udnsWatchResult[0];
  const udnsLoaded = udnsWatchResult[1];
  const udnsError = toWatchError(udnsWatchResult[2]);

  const nadsWatchResult = useK8sWatchResource<NetworkAttachmentDefinitionKind[]>({
    groupVersionKind: NetworkAttachmentDefinitionModelGroupVersionKind,
    isList: true,
  });
  const nads = nadsWatchResult[0];
  const nadsLoaded = nadsWatchResult[1];
  const nadsError = toWatchError(nadsWatchResult[2]);

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
    nadsError ?? cudnsError ?? udnsError,
  ];
};

export default useOtherVMNetworks;
