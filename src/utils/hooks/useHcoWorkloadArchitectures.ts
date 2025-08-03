import useHyperConvergeConfiguration from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';

const useHcoWorkloadArchitectures = () => {
  const [hyperConverge] = useHyperConvergeConfiguration();

  return hyperConverge?.status?.nodeInfo?.workloadsArchitectures ?? [];
};

export default useHcoWorkloadArchitectures;
