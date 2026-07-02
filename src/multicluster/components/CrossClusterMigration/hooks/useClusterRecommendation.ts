import { useMemo, useState } from 'react';

import useConsoleFetch from '@kubevirt-utils/hooks/useConsoleFetch';

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
  const [triggered, setTriggered] = useState(false);

  const url = useMemo(
    () => (advisorBaseURL ? buildURL(advisorBaseURL, params) : null),
    [advisorBaseURL, params],
  );

  const { data, error, loaded } = useConsoleFetch<MigrationTargetResponse>(triggered ? url : null);

  const fetchRecommendation = () => setTriggered(true);

  return { data: data ?? null, error, fetchRecommendation, loaded, loading: triggered && !loaded };
};

export default useClusterRecommendation;
