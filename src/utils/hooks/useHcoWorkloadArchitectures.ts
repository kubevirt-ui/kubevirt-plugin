import useHyperConvergeConfiguration from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { useHubClusterName } from '@stolostron/multicluster-sdk';

const useHcoWorkloadArchitectures = (cluster?: string) => {
  const [hyperConverge] = useHyperConvergeConfiguration(cluster);
  const [hubClusterName] = useHubClusterName();
  const defaultWorkloadArchitectures =
    isEmpty(cluster) || cluster === hubClusterName ? window.SERVER_FLAGS?.nodeArchitectures : [];

  return hyperConverge?.status?.nodeInfo?.workloadsArchitectures ?? defaultWorkloadArchitectures;
};

export default useHcoWorkloadArchitectures;
