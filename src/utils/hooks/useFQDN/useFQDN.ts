import { useMemo } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { DNSConfigModel, modelToGroupVersionKind } from '@kubevirt-utils/models';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { K8sResourceKind, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

const useFQDN = (nicName: string, vm: V1VirtualMachine): string | undefined => {
  const [dns] = useK8sWatchResource<K8sResourceKind>({
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
