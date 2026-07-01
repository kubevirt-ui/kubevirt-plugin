import { useCallback, useState } from 'react';

import { consoleFetch } from '@openshift-console/dynamic-plugin-sdk';

import { MigrationTargetResponse } from './useClusterRecommendationTypes';

type VMQueryParams = {
  cluster: string;
  vmName: string;
  vmNamespace: string;
};

type UseClusterRecommendation = {
  data: MigrationTargetResponse | null;
  error: Error | null;
  fetchRecommendation: () => void;
  loaded: boolean;
  loading: boolean;
};

const buildURL = (proxyBase: string, params: VMQueryParams): string => {
  const queryParams = new URLSearchParams({
    cluster: params.cluster,
    vmName: params.vmName,
    vmNamespace: params.vmNamespace,
  });
  return `${proxyBase}/api/v1/migration-targets?${queryParams.toString()}`;
};

const useClusterRecommendation = (
  advisorBaseURL: null | string,
  params: VMQueryParams,
): UseClusterRecommendation => {
  const [data, setData] = useState<MigrationTargetResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchRecommendation = useCallback(async () => {
    if (!advisorBaseURL) {
      setError(new Error('Advisor service is not available'));
      return;
    }

    setLoading(true);
    setError(null);
    setLoaded(false);

    try {
      const url = buildURL(advisorBaseURL, params);
      const response = await consoleFetch(url);
      const json = await response.json();
      setData(json);
      setLoaded(true);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
      setLoaded(true);
    } finally {
      setLoading(false);
    }
  }, [advisorBaseURL, params]);

  return { data, error, fetchRecommendation, loaded, loading };
};

export default useClusterRecommendation;
