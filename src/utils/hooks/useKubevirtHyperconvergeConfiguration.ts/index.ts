import { useMemo } from 'react';

import { V1KubeVirtConfiguration } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { operatorNamespaceSignal } from '@kubevirt-utils/hooks/useOperatorNamespace/useOperatorNamespace';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

import { KUBEVIRT_HC_GROUP_VERSION_KIND, KUBEVIRT_HC_NAME } from './constants';

export type KubevirtHyperconverged = K8sResourceCommon & {
  spec: {
    configuration: V1KubeVirtConfiguration;
  };
};

const useKubevirtHyperconvergeConfiguration = (
  cluster?: string,
): {
  featureGates: string[];
  hcConfig: KubevirtHyperconverged;
  hcError: any;
  hcLoaded: boolean;
} => {
  const operatorNamespace = operatorNamespaceSignal.value;

  const [hcConfig, hcLoaded, hcError] = useK8sWatchData<KubevirtHyperconverged>(
    operatorNamespace && {
      cluster,
      groupVersionKind: KUBEVIRT_HC_GROUP_VERSION_KIND,
      name: KUBEVIRT_HC_NAME,
      namespace: operatorNamespace,
    },
  );

  const featureGates = useMemo(() => {
    return hcConfig?.spec?.configuration?.developerConfiguration?.featureGates;
  }, [hcConfig]);

  return { featureGates, hcConfig, hcError, hcLoaded };
};

export default useKubevirtHyperconvergeConfiguration;
