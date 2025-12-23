import { useMemo } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { DNSConfigModel, modelToGroupVersionKind } from '@kubevirt-utils/models';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getCluster } from '@multicluster/helpers/selectors';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import { K8sResourceKind } from '@openshift-console/dynamic-plugin-sdk';

const useFQDN = (nicName: string, vm: V1VirtualMachine): string | undefined => {
  const [dns] = useK8sWatchData<K8sResourceKind>({
    cluster: getCluster(vm),
    groupVersionKind: modelToGroupVersionKind(DNSConfigModel),
    name: 'cluster',
  });

  return useMemo(() => {
    const clusterDomain = dns?.spec?.baseDomain;

    if (!nicName || !vm || !clusterDomain) {
      return undefined;
    }

    return `${nicName}.${getName(vm)}.${getNamespace(vm)}.${clusterDomain}`;
  }, [nicName, vm, dns?.spec?.baseDomain]);
};

export default useFQDN;
