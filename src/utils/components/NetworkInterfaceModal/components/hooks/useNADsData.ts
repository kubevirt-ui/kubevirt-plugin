import { useMemo } from 'react';

import { NetworkAttachmentDefinitionModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import useNADListPermissions from '@kubevirt-utils/components/NetworkInterfaceModal/components/hooks/useNADListPermissions';
import { getExtraNADResources } from '@kubevirt-utils/components/NetworkInterfaceModal/components/hooks/utils';
import { getName } from '@kubevirt-utils/resources/shared';
import { PRIMARY_UDN_BINDING } from '@kubevirt-utils/resources/vm/utils/network/constants';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { K8sResourceCommon, useK8sWatchResources } from '@openshift-console/dynamic-plugin-sdk';

import { UseNADsData } from './types';

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
        const nadsWithNoPrimaryUDNBinding =
          nads?.data?.filter((nad) => getName(nad) !== PRIMARY_UDN_BINDING) || [];
        acc.nads.push(...nadsWithNoPrimaryUDNBinding);
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
