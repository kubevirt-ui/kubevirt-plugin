import { useMemo } from 'react';

import { GLOBAL_NAD_NAMESPACES } from '@kubevirt-utils/constants/constants';
import { NetworkAttachmentDefinitionModelGroupVersionKind } from '@kubevirt-utils/models';
import { type NetworkAttachmentDefinitionKind } from '@kubevirt-utils/resources/nad/types';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';

import useNADListPermissions from './useNADListPermissions';
import { resources, watchResourceIfAllowed } from './utils';

export const useFetchNADs = (
  namespace: string,
  cluster: string,
  // K8s watch errors are untyped from the Console SDK.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- propagated to useNADsData consumers
): [data: NetworkAttachmentDefinitionKind[], loaded: boolean, error: any] => {
  const allowMap = useNADListPermissions(cluster);
  const [namespaceData, namespaceLoaded, namespaceLoadError] = useK8sWatchData<
    NetworkAttachmentDefinitionKind[]
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
    NetworkAttachmentDefinitionKind[]
  >(watchResourceIfAllowed(resources.default, allowMap.default, cluster));

  const [multusData, multusLoaded, multusLoadError] = useK8sWatchData<
    NetworkAttachmentDefinitionKind[]
  >(watchResourceIfAllowed(resources.OPENSHIFT_MULTUS_NS, allowMap.OPENSHIFT_MULTUS_NS, cluster));

  const [sriovData, sriovLoaded, sriovLoadError] = useK8sWatchData<
    NetworkAttachmentDefinitionKind[]
  >(
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
