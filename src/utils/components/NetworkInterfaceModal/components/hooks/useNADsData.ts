import { useMemo } from 'react';

import { NetworkAttachmentDefinitionModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import useNADListPermissions from '@kubevirt-utils/components/NetworkInterfaceModal/components/hooks/useNADListPermissions';
import { getExtraNADResources } from '@kubevirt-utils/components/NetworkInterfaceModal/components/hooks/utils';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { K8sResourceCommon, useK8sWatchResources } from '@openshift-console/dynamic-plugin-sdk';

type UseNADsData = (namespace: string) => {
  loaded: boolean;
  loadError: string;
  nads: K8sResourceCommon[];
};

const useNADsData: UseNADsData = (namespace) => {
  const nadListPermissionsMap = useNADListPermissions();
  const data = useK8sWatchResources<{ [key: string]: K8sResourceCommon[] }>({
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
        acc.nads.push(...nads?.data);
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
