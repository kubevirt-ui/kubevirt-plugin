import { useMemo } from 'react';

import useHyperConvergeConfiguration from '../useHyperConvergeConfiguration';

const useIsFQDNEnabled = () => {
  const [hyperConverge, hyperLoaded, hyperError] = useHyperConvergeConfiguration();

  return useMemo(
    () => hyperLoaded && !hyperError && hyperConverge?.spec?.featureGates?.deployKubeSecondaryDNS,
    [hyperConverge, hyperLoaded, hyperError],
  );
};

export default useIsFQDNEnabled;
