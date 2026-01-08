import { useMemo } from 'react';

import { GLOBAL_NAD_NAMESPACES } from '@kubevirt-utils/constants/constants';
import { NetworkAttachmentDefinitionModelGroupVersionKind } from '@kubevirt-utils/models';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';

import { NetworkAttachmentDefinition } from './types';
import useNADListPermissions from './useNADListPermissions';
import { resources, watchResourceIfAllowed } from './utils';

export const useFetchNADs = (
  namespace: string,
  cluster: string,
): [data: NetworkAttachmentDefinition[], loaded: boolean, error: any] => {
  const allowMap = useNADListPermissions(cluster);
  const [namespaceData, namespaceLoaded, namespaceLoadError] = useK8sWatchData<
    NetworkAttachmentDefinition[]
  >(
    watchResourceIfAllowed(
      {
        groupVersionKind: NetworkAttachmentDefinitionModelGroupVersionKind,
        isList: true,
        namespace: namespace,
      },
      !GLOBAL_NAD_NAMESPACES.includes(namespace),
      cluster,
    ),
  );

  const [defaultData, defaultLoaded, defaultLoadError] = useK8sWatchData<
    NetworkAttachmentDefinition[]
  >(watchResourceIfAllowed(resources.default, allowMap.default, cluster));

  const [multusData, multusLoaded, multusLoadError] = useK8sWatchData<
    NetworkAttachmentDefinition[]
  >(watchResourceIfAllowed(resources.OPENSHIFT_MULTUS_NS, allowMap.OPENSHIFT_MULTUS_NS, cluster));

  const [sriovData, sriovLoaded, sriovLoadError] = useK8sWatchData<NetworkAttachmentDefinition[]>(
    watchResourceIfAllowed(
      resources.OPENSHIFT_SRIOV_NETWORK_OPERATOR_NS,
      allowMap.OPENSHIFT_SRIOV_NETWORK_OPERATOR_NS,
      cluster,
    ),
  );

  const allNADs = useMemo(
    () => [
      ...(namespaceData || []),
      ...(defaultData || []),
      ...(multusData || []),
      ...(sriovData || []),
    ],
    [namespaceData, defaultData, multusData, sriovData],
  );

  const loaded = namespaceLoaded && sriovLoaded && multusLoaded && defaultLoaded;

  const error = namespaceLoadError || defaultLoadError || multusLoadError || sriovLoadError;

  return [allNADs, loaded, error];
};
