import { useMemo } from 'react';

import { isFeatureGateEnabled } from '@kubevirt-utils/resources/hyperconverged/selectors';

import useHyperConvergeConfiguration from '../useHyperConvergeConfiguration';

const DEPLOY_KUBE_SECONDARY_DNS_GATE = 'deployKubeSecondaryDNS';

const useIsFQDNEnabled = (): boolean => {
  const [hyperConverge, hyperLoaded, hyperError] = useHyperConvergeConfiguration();

  return useMemo(
    () =>
      hyperLoaded &&
      !hyperError &&
      isFeatureGateEnabled(hyperConverge, DEPLOY_KUBE_SECONDARY_DNS_GATE),
    [hyperConverge, hyperLoaded, hyperError],
  );
};

export default useIsFQDNEnabled;
