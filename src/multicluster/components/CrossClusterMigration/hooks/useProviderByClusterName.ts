import { V1beta1Provider } from '@kubev2v/types';

import { getProviderByClusterName } from '../utils';

import useProviders from './useProviders';

const useProviderByClusterName = (
  cluster?: string,
): [undefined | V1beta1Provider, boolean, any] => {
  const [providers, providersLoaded, providersError] = useProviders();

  return [getProviderByClusterName(cluster, providers), providersLoaded, providersError];
};

export default useProviderByClusterName;
