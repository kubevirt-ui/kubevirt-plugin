import { useMemo } from 'react';

import { NetworkAttachmentDefinitionModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { K8sResourceCommon, useK8sWatchResources } from '@openshift-console/dynamic-plugin-sdk';

type UseNadsData = (namespace: string) => {
  nads: K8sResourceCommon[];
  loaded: boolean;
  loadError: string;
};

const useNadsData: UseNadsData = (namespace) => {
  const data = useK8sWatchResources<{ [key: string]: K8sResourceCommon[] }>({
    [namespace]: {
      groupVersionKind: NetworkAttachmentDefinitionModelGroupVersionKind,
      isList: true,
      namespace: namespace,
    },
    //global ns to get usable nads
    default: {
      groupVersionKind: NetworkAttachmentDefinitionModelGroupVersionKind,
      isList: true,
      namespace: 'default',
    },
    'openshift-sriov-network-operator': {
      groupVersionKind: NetworkAttachmentDefinitionModelGroupVersionKind,
      isList: true,
      namespace: 'openshift-sriov-network-operator',
    },
    'openshift-multus': {
      groupVersionKind: NetworkAttachmentDefinitionModelGroupVersionKind,
      isList: true,
      namespace: 'openshift-multus',
    },
  });

  const accumulateData = useMemo(() => {
    return (Object.values(data) || [])?.reduce(
      (acc, nads) => {
        acc.nads.push(...nads?.data);
        acc.loaded = acc.loaded && nads?.loaded;
        acc.loadError = isEmpty(nads?.loadError) ? acc.loadError : nads?.loadError;
        return acc;
      },
      { nads: [], loaded: true, loadError: null },
    );
  }, [data]);

  return accumulateData;
};

export default useNadsData;
