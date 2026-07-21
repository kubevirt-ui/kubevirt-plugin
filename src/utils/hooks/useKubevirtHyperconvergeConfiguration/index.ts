import { useMemo } from 'react';

import { V1KubeVirtConfiguration } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getHyperconvergedConfiguration } from '@kubevirt-utils/resources/hyperconverged/selectors';
import { operatorNamespaceSignal } from '@kubevirt-utils/store/operatorNamespace';
import { isEmpty } from '@kubevirt-utils/utils/utils';
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
  disabledFeatureGates: string[];
  featureGates: string[];
  hcConfig: KubevirtHyperconverged;
  hcError: any;
  hcLoaded: boolean;
} => {
  const operatorNamespace = operatorNamespaceSignal.value;

  const [hcConfig, _hcLoaded, hcError] = useK8sWatchData<KubevirtHyperconverged>(
    operatorNamespace && {
      cluster,
      groupVersionKind: KUBEVIRT_HC_GROUP_VERSION_KIND,
      name: KUBEVIRT_HC_NAME,
      namespace: operatorNamespace,
    },
  );

  const hcLoaded = _hcLoaded && !isEmpty(operatorNamespace);

  const developerConfiguration = useMemo(() => {
    return getHyperconvergedConfiguration(hcConfig)?.developerConfiguration;
  }, [hcConfig]);

  const featureGates = developerConfiguration?.featureGates;

  // Not yet in kubevirt-api types; present on KubeVirt 1.8+/1.9+ for Beta opt-out.
  const disabledFeatureGates = (
    developerConfiguration as { disabledFeatureGates?: string[] } | undefined
  )?.disabledFeatureGates;

  return { disabledFeatureGates, featureGates, hcConfig, hcError, hcLoaded };
};

export default useKubevirtHyperconvergeConfiguration;
