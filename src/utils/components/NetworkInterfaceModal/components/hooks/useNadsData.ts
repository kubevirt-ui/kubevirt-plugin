import { useMemo } from 'react';

import { NetworkAttachmentDefinitionModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import {
  DEFAULT_NAMESPACE,
  OPENSHIFT_MULTUS_NS,
  OPENSHIFT_SRIOV_NETWORK_OPERATOR_NS,
} from '@kubevirt-utils/constants/constants';
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
    ...(namespace !== DEFAULT_NAMESPACE && {
      default: {
        groupVersionKind: NetworkAttachmentDefinitionModelGroupVersionKind,
        isList: true,
        namespace: DEFAULT_NAMESPACE,
      },
    }),
    OPENSHIFT_SRIOV_NETWORK_OPERATOR_NS: {
      groupVersionKind: NetworkAttachmentDefinitionModelGroupVersionKind,
      isList: true,
      namespace: OPENSHIFT_SRIOV_NETWORK_OPERATOR_NS,
    },
    OPENSHIFT_MULTUS_NS: {
      groupVersionKind: NetworkAttachmentDefinitionModelGroupVersionKind,
      isList: true,
      namespace: OPENSHIFT_MULTUS_NS,
    },
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

export default useNadsData;
