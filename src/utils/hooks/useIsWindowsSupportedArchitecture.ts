import { ARCHITECTURES } from '@kubevirt-utils/constants/constants';
import useHcoWorkloadArchitectures from '@kubevirt-utils/hooks/useHcoWorkloadArchitectures';
import useClusterParam from '@multicluster/hooks/useClusterParam';

const WINDOWS_SUPPORTED_ARCHITECTURES: string[] = [ARCHITECTURES.AMD64, ARCHITECTURES.ARM64];

const useIsWindowsSupportedArchitecture = (cluster?: string): boolean => {
  const clusterParam = useClusterParam();
  const resolvedCluster = cluster || clusterParam;
  const architectures = useHcoWorkloadArchitectures(resolvedCluster);

  if (!architectures?.length) return true;

  return architectures.some((arch) => WINDOWS_SUPPORTED_ARCHITECTURES.includes(arch));
};

export default useIsWindowsSupportedArchitecture;
