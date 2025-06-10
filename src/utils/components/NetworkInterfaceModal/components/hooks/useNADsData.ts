import { useMemo } from 'react';

import { NetworkAttachmentDefinitionModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import useNADListPermissions from '@kubevirt-utils/components/NetworkInterfaceModal/components/hooks/useNADListPermissions';
import {
  filterUDNNads,
  getExtraNADResources,
} from '@kubevirt-utils/components/NetworkInterfaceModal/components/hooks/utils';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { useK8sWatchResources } from '@openshift-console/dynamic-plugin-sdk';

import { NetworkAttachmentDefinition, UseNADsData } from './types';

const useNADsData: UseNADsData = (namespace) => {
  const nadListPermissionsMap = useNADListPermissions();
  const data = useK8sWatchResources<{ [key: string]: NetworkAttachmentDefinition[] }>({
    [namespace]: {
      groupVersionKind: NetworkAttachmentDefinitionModelGroupVersionKind,
      isList: true,
      namespace: namespace,
    },
    ...getExtraNADResources(namespace, nadListPermissionsMap),
  });

  const accumulatedData = useMemo(() => {
    return (Object.values(data) || [])?.reduce(
      (acc, nads) => {
        const availableNADs = filterUDNNads(nads?.data || []);
        acc.nads.push(...availableNADs);
        acc.loaded = acc.loaded && (!isEmpty(nads?.loadError) || nads?.loaded);
        acc.loadError = isEmpty(nads?.loadError) ? acc.loadError : nads?.loadError;
        return acc;
      },
      { loaded: true, loadError: null, nads: [] },
    );
  }, [data]);

  return accumulatedData;
};

export default useNADsData;
