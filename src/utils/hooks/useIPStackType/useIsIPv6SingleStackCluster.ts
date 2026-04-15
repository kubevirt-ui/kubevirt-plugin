import { IPStackType } from './types';
import useIPStackType from './useIPStackType';

const useIsIPv6SingleStackCluster = (cluster?: string): boolean => {
  const ipStackType = useIPStackType(cluster);

  return ipStackType === IPStackType.IPv6SingleStack;
};

export default useIsIPv6SingleStackCluster;
