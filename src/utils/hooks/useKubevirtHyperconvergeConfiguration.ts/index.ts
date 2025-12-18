import { useMemo } from 'react';

import { V1KubeVirtConfiguration } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { DEFAULT_OPERATOR_NAMESPACE } from '@kubevirt-utils/utils/utils';
import { K8sResourceCommon, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

import { KUBEVIRT_HC_GROUP_VERSION_KIND, KUBEVIRT_HC_NAME } from './constants';

export type KubevirtHyperconverged = K8sResourceCommon & {
  spec: {
    configuration: V1KubeVirtConfiguration;
  };
};

const useKubevirtHyperconvergeConfiguration = (): {
  featureGates: string[];
  hcConfig: KubevirtHyperconverged;
  hcError: any;
  hcLoaded: boolean;
} => {
  const [hcConfig, hcLoaded, hcError] = useK8sWatchResource<KubevirtHyperconverged>({
    groupVersionKind: KUBEVIRT_HC_GROUP_VERSION_KIND,
    name: KUBEVIRT_HC_NAME,
    namespace: DEFAULT_OPERATOR_NAMESPACE,
  });

  const featureGates = useMemo(() => {
    return hcConfig?.spec?.configuration?.developerConfiguration?.featureGates;
  }, [hcConfig]);

  return { featureGates, hcConfig, hcError, hcLoaded };
};

export default useKubevirtHyperconvergeConfiguration;
