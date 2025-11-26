import { useMemo } from 'react';

import { PrometheusEndpoint, usePrometheusPoll } from '@openshift-console/dynamic-plugin-sdk';
import { SETTINGS_TAB_QUERIES } from '@overview/SettingsTab/utils/queries';

const useAppliedOvercommitRatio = (): { appliedRatio: null | number; isLoading: boolean } => {
  const query = SETTINGS_TAB_QUERIES.MEMORY_DENSITY_APPLIED_RATIO;

  const [data, loaded] = usePrometheusPoll({
    endpoint: PrometheusEndpoint.QUERY,
    query,
  });

  const appliedRatio = useMemo(() => {
    const result = data?.data?.result;
    if (!result || result.length === 0) {
      return null;
    }

    const value = result[0]?.value?.[1];
    return value ? Math.round(parseFloat(value)) : null;
  }, [data]);

  return {
    appliedRatio,
    isLoading: !loaded,
  };
};

export default useAppliedOvercommitRatio;
