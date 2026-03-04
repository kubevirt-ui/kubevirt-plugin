import useHyperConvergeConfiguration from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { getAAQCalculationMethod } from '@kubevirt-utils/resources/hyperconverged/selectors';
import { CalculationMethod } from '@kubevirt-utils/resources/quotas/types';

const useAAQCalculationMethod = (): CalculationMethod => {
  const [hyperConverge] = useHyperConvergeConfiguration();

  return getAAQCalculationMethod(hyperConverge);
};

export default useAAQCalculationMethod;
