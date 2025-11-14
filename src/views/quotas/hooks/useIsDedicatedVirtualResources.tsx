import useHyperConvergeConfiguration from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';

const useIsDedicatedVirtualResources = () => {
  const [hyperConverge] = useHyperConvergeConfiguration();

  return (
    hyperConverge?.spec?.applicationAwareConfig?.vmiCalcConfigName === 'DedicatedVirtualResources'
  );
};

export default useIsDedicatedVirtualResources;
