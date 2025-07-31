import { V1beta1Provider } from '@kubev2v/types';
import { useHubClusterName } from '@stolostron/multicluster-sdk';

import { getProviderByClusterName } from '../utils';

import useProviders from './useProviders';

const useProviderByClusterName = (
  cluster?: string,
): [undefined | V1beta1Provider, boolean, any] => {
  const [providers, providersLoaded, providersError] = useProviders();
  const [hubClusterName, hubClusterNameLoaded, hubClusterNameError] = useHubClusterName();

  return [
    getProviderByClusterName(cluster, hubClusterName, providers),
    providersLoaded && hubClusterNameLoaded,
    providersError || hubClusterNameError,
  ];
};

export default useProviderByClusterName;
