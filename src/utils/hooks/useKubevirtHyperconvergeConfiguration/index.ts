import { useMemo } from 'react';

import { V1KubeVirtConfiguration } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { OPERATOR_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { getHyperconvergedConfiguration } from '@kubevirt-utils/resources/hyperconverged/selectors';
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
  const [hcConfig, hcLoaded, hcError] = useK8sWatchData<KubevirtHyperconverged>({
    cluster,
    groupVersionKind: KUBEVIRT_HC_GROUP_VERSION_KIND,
    name: KUBEVIRT_HC_NAME,
    namespace: OPERATOR_NAMESPACE,
  });

  const featureGates = useMemo(() => {
    return getHyperconvergedConfiguration(hcConfig)?.developerConfiguration?.featureGates;
  }, [hcConfig]);

  return { featureGates, hcConfig, hcError, hcLoaded };
};

export default useKubevirtHyperconvergeConfiguration;
