import { useMemo } from 'react';

import { useFetchNADs } from '@kubevirt-utils/components/NetworkInterfaceModal/components/hooks/useFetchNADs';
import { filterUDNNads } from '@kubevirt-utils/components/NetworkInterfaceModal/components/hooks/utils';
import { NetworkAttachmentDefinitionModelGroupVersionKind } from '@kubevirt-utils/models';
import { type NetworkAttachmentDefinitionKind } from '@kubevirt-utils/resources/nad/types';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';

import useProjectNetworkSettings from './useProjectNetworkSettings';

type UseProjectDefaultNadArgs = {
  cluster?: string;
  namespaceName?: string;
};

type UseProjectDefaultNadReturn = {
  vmCreationNad?: NetworkAttachmentDefinitionKind;
};

const useProjectDefaultNad = ({
  cluster,
  namespaceName,
}: UseProjectDefaultNadArgs): UseProjectDefaultNadReturn => {
  const { defaultNadName, isPodNetworkAllowed } = useProjectNetworkSettings({
    cluster,
    namespaceName,
  });

  const [nads] = useFetchNADs(namespaceName ?? '', cluster);

  const [annotatedNad] = useK8sWatchData<NetworkAttachmentDefinitionKind>(
    defaultNadName && namespaceName
      ? {
          cluster,
          groupVersionKind: NetworkAttachmentDefinitionModelGroupVersionKind,
          name: defaultNadName,
          namespace: namespaceName,
        }
      : null,
  );

  const firstAvailableNad = useMemo((): NetworkAttachmentDefinitionKind | undefined => {
    const { regular } = filterUDNNads(nads) as {
      primary: NetworkAttachmentDefinitionKind[];
      regular: NetworkAttachmentDefinitionKind[];
    };
    return regular?.[0];
  }, [nads]);

  const vmCreationNad = useMemo((): NetworkAttachmentDefinitionKind | undefined => {
    if (defaultNadName) {
      return annotatedNad;
    }

    if (!isPodNetworkAllowed) {
      return firstAvailableNad;
    }

    return undefined;
  }, [annotatedNad, defaultNadName, firstAvailableNad, isPodNetworkAllowed]);

  return {
    vmCreationNad,
  };
};

export default useProjectDefaultNad;
