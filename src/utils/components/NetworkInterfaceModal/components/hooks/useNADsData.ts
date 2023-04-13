import { useMemo } from 'react';

import { NetworkAttachmentDefinitionModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import useNADListPermissions from '@kubevirt-utils/components/NetworkInterfaceModal/components/hooks/useNADListPermissions';
import { getOtherNADResources } from '@kubevirt-utils/components/NetworkInterfaceModal/components/hooks/utils';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { K8sResourceCommon, useK8sWatchResources } from '@openshift-console/dynamic-plugin-sdk';

type UseNADsData = (namespace: string) => {
  nads: K8sResourceCommon[];
  loaded: boolean;
  loadError: string;
};

const useNADsData: UseNADsData = (namespace) => {
  const canListGlobalNSNADs = useNADListPermissions();
  const data = useK8sWatchResources<{ [key: string]: K8sResourceCommon[] }>({
    [namespace]: {
      groupVersionKind: NetworkAttachmentDefinitionModelGroupVersionKind,
      isList: true,
      namespace: namespace,
    },
    ...getOtherNADResources(namespace, canListGlobalNSNADs),
  });

  const accumulateData = useMemo(() => {
    return (Object.values(data) || [])?.reduce(
      (acc, nads) => {
        acc.nads.push(...nads?.data);
        acc.loaded = acc.loaded && (!isEmpty(nads?.loadError) || nads?.loaded);
        acc.loadError = isEmpty(nads?.loadError) ? acc.loadError : nads?.loadError;
        return acc;
      },
      { nads: [], loaded: true, loadError: null },
    );
  }, [data]);

  return accumulateData;
};

export default useNADsData;
