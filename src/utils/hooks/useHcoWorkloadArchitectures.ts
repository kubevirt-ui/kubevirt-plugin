import useHyperConvergeConfiguration from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { useHubClusterName } from '@stolostron/multicluster-sdk';

const useHcoWorkloadArchitectures = (cluster?: string): [string[], boolean] => {
  const [hyperConverge, loaded, error] = useHyperConvergeConfiguration(cluster);
  const [hubClusterName] = useHubClusterName();
  const defaultWorkloadArchitectures =
    isEmpty(cluster) || cluster === hubClusterName ? window.SERVER_FLAGS?.nodeArchitectures : [];

  const architectures =
    hyperConverge?.status?.nodeInfo?.workloadsArchitectures ?? defaultWorkloadArchitectures;

  return [architectures, loaded || !!error];
};

export default useHcoWorkloadArchitectures;
