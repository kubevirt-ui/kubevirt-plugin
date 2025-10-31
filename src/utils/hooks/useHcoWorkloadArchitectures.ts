import useHyperConvergeConfiguration from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';

const useHcoWorkloadArchitectures = (cluster?: string) => {
  const [hyperConverge] = useHyperConvergeConfiguration(cluster);

  return hyperConverge?.status?.nodeInfo?.workloadsArchitectures ?? [];
};

export default useHcoWorkloadArchitectures;
