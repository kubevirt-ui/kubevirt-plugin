import { DEFAULT_RUN_STRATEGY } from '@kubevirt-utils/hooks/useFeatures/constants';
import useFeaturesConfigMap from '@kubevirt-utils/hooks/useFeatures/useFeaturesConfigMap';
import {
  getDefaultRunningStrategy,
  type RunStrategy,
} from '@kubevirt-utils/resources/vm/utils/constants';

const useDefaultRunStrategy = (cluster?: string): RunStrategy => {
  const {
    featuresConfigMapData: [featureConfigMap],
  } = useFeaturesConfigMap(cluster);

  return getDefaultRunningStrategy(featureConfigMap?.data?.[DEFAULT_RUN_STRATEGY]);
};

export default useDefaultRunStrategy;
