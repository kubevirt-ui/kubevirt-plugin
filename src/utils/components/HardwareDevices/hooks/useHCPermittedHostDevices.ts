import * as React from 'react';

import {
  V1KubeVirtConfiguration,
  V1PermittedHostDevices,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { HyperConvergedModelGroupVersionKind } from '@kubevirt-utils/models';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

const useHCPermittedHostDevices = (): V1PermittedHostDevices => {
  const hcWatchResource = React.useMemo(() => {
    return {
      groupVersionKind: HyperConvergedModelGroupVersionKind,
      isList: true,
    };
  }, []);

  const [hcList] = useK8sWatchResource(hcWatchResource);

  const hc = React.useMemo(() => hcList?.[0], [hcList]);
  const { permittedHostDevices }: V1KubeVirtConfiguration = hc?.spec || {};

  return permittedHostDevices;
};

export default useHCPermittedHostDevices;
