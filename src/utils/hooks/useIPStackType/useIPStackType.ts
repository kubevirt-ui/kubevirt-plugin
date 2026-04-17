import useFeaturesConfigMap from '@kubevirt-utils/hooks/useFeatures/useFeaturesConfigMap';

import { IP_STACK_TYPE_KEY } from './constants';
import { IPStackType } from './types';

const useIPStackType = (cluster?: string): IPStackType | undefined => {
  const { featuresConfigMapData } = useFeaturesConfigMap(cluster);
  const [configMap] = featuresConfigMapData;

  const rawValue = configMap?.data?.[IP_STACK_TYPE_KEY] as IPStackType;

  if (Object.values(IPStackType).includes(rawValue)) {
    return rawValue;
  }

  return undefined;
};

export default useIPStackType;
