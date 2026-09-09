import { type V1beta1Provider } from '@forklift-ui/types';

import { getProviderByClusterName } from '../utils';

import useProviders from './useProviders';

const useProviderByClusterName = (
  cluster?: string,
): [undefined | V1beta1Provider, boolean, Error | undefined] => {
  const [providers, providersLoaded, providersError] = useProviders();

  return [
    cluster ? getProviderByClusterName(cluster, providers) : undefined,
    providersLoaded,
    providersError,
  ];
};

export default useProviderByClusterName;
