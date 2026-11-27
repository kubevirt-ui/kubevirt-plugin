import { useMemo } from 'react';

import { useFetchNADs } from '@kubevirt-utils/components/NetworkInterfaceModal/components/hooks/useFetchNADs';
import { filterUDNNads } from '@kubevirt-utils/components/NetworkInterfaceModal/components/hooks/utils';
import { NetworkAttachmentDefinitionModelGroupVersionKind } from '@kubevirt-utils/models';
import { type NetworkAttachmentDefinitionKind } from '@kubevirt-utils/resources/nad/types';
import { parseVMMultusIntoNAD } from '@kubevirt-utils/resources/nad/utils';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';

import useProjectNetworkSettings from './useProjectNetworkSettings';

type UseProjectDefaultNadArgs = {
  cluster?: string;
  namespaceName?: string;
};

type UseProjectDefaultNadReturn = {
  defaultNadError?: Error;
  defaultNadName?: string;
  loaded: boolean;
  vmCreationNad?: NetworkAttachmentDefinitionKind;
};

const useProjectDefaultNad = ({
  cluster,
  namespaceName,
}: UseProjectDefaultNadArgs): UseProjectDefaultNadReturn => {
  const {
    defaultNadName,
    isPodNetworkAllowed,
    loaded: networkSettingsLoaded,
  } = useProjectNetworkSettings({
    cluster,
    namespaceName,
  });

  const [nads, nadsLoaded] = useFetchNADs(namespaceName ?? '', cluster);

  const defaultNadReference =
    defaultNadName && namespaceName
      ? parseVMMultusIntoNAD(defaultNadName, namespaceName)
      : undefined;

  const [annotatedNad, annotatedNadLoaded, annotatedNadError] =
    useK8sWatchData<NetworkAttachmentDefinitionKind>(
      defaultNadReference
        ? {
            cluster,
            groupVersionKind: NetworkAttachmentDefinitionModelGroupVersionKind,
            name: defaultNadReference.name,
            namespace: defaultNadReference.namespace,
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

  const vmCreationNadLoaded = defaultNadName
    ? annotatedNadLoaded || Boolean(annotatedNadError)
    : isPodNetworkAllowed || nadsLoaded;

  return {
    defaultNadError: annotatedNadError,
    defaultNadName,
    loaded: networkSettingsLoaded && vmCreationNadLoaded,
    vmCreationNad,
  };
};

export default useProjectDefaultNad;
