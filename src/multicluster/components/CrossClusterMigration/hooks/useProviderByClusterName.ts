/* eslint-disable */
import { type V1beta1Provider } from '@forklift-ui/types';

import { getProviderByClusterName } from '../utils';

import useProviders from './useProviders';

const useProviderByClusterName = (
  cluster?: string,
): [undefined | V1beta1Provider, boolean, Error | undefined] => {
  const [providers, providersLoaded, providersError] = useProviders();

  return [getProviderByClusterName(cluster, providers), providersLoaded, providersError];
};

export default useProviderByClusterName;
