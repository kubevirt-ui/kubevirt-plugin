import { type V1beta1Provider } from '@forklift-ui/types';
import { getName } from '@kubevirt-utils/resources/shared';

export const getClusterMajorMinorVersion = (clusterVersion: string): null | string => {
  if (!clusterVersion) return null;

  const version = clusterVersion?.split('.');
  return version.length > 1 ? version[0] + '.' + version[1] : version[0];
};

export const getClusterFromProvider = (provider: string): string => {
  return provider?.replace(/-mtv$/, '');
};

export const getProviderNameFromCluster = (cluster: string): string => {
  if (!cluster) return '';

  return cluster + '-mtv';
};

export const getProviderByClusterName = (
  cluster: string,
  providers: V1beta1Provider[],
): V1beta1Provider | undefined => {
  return providers?.find((provider) => getName(provider) === getProviderNameFromCluster(cluster));
};
